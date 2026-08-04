import { and, asc, eq, inArray } from "drizzle-orm";
import { articles, articleTags, categories, sources, tags } from "../../db/schema";
import type { AppDatabase } from "./db";

/**
 * خط الابتلاع: تغذية RSS ← نص خام ← توليد منظَّم ← **مسودة** بانتظار المراجعة.
 *
 * قرار تصميمي مقصود: لا يُنشَر شيء تلقائياً افتراضياً. رفع علم
 * `INGEST_AUTOPUBLISH=true` يتخطّى بوابة المراجعة، وهو قرار المالك ومسؤوليته:
 * النشر الآلي المكثّف يعرّض الموقع لعقوبات «المحتوى المُوسَّع» من محركات البحث
 * ولمخاطر على حساب الإعلانات.
 */

export type IngestStats = {
  source: string;
  fetched: number;
  skippedDuplicate: number;
  skippedShort: number;
  generated: number;
  failed: number;
  errors: string[];
};

const MAX_PER_RUN = Number(process.env.INGEST_MAX_PER_RUN ?? 5);
const AUTOPUBLISH = process.env.INGEST_AUTOPUBLISH === "true";
const COVERS = ["red", "navy", "gold", "teal", "plum"] as const;

/** غلاف ثابت مشتق من نص — نفس المقال يحصل على نفس اللون دائماً */
function coverFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length]!;
}

/** يربط وسوم النموذج بالمحاور الموجودة، وينشئ الناقص منها */
async function resolveTagIds(db: AppDatabase, names: string[]): Promise<number[]> {
  const clean = [...new Set(names.map((n) => n.trim()).filter((n) => n.length > 1 && n.length <= 100))];
  if (!clean.length) return [];

  const slugs = clean.map((n) => normalizeSlug(n) || "t");
  const existing = await db.query.tags.findMany({ where: inArray(tags.slug, slugs) });
  const bySlug = new Map(existing.map((t) => [t.slug, t.id]));

  const missing = clean.filter((_, i) => !bySlug.has(slugs[i]!));
  if (missing.length) {
    await db.insert(tags).values(
      missing.map((name, i) => ({ name, slug: slugs[clean.indexOf(missing[i]!)]! })),
    );
    const created = await db.query.tags.findMany({ where: inArray(tags.slug, slugs) });
    for (const t of created) bySlug.set(t.slug, t.id);
  }

  return slugs.map((s) => bySlug.get(s)).filter((v): v is number => typeof v === "number");
}

/** يضمن تفرّد الـslug داخل القسم بإضافة لاحقة رقمية عند التعارض */
async function uniqueSlug(db: AppDatabase, base: string, categoryId: number): Promise<string> {
  let slug = base || "news";
  for (let n = 2; n < 50; n++) {
    const clash = await db.query.articles.findFirst({
      where: and(eq(articles.slug, slug), eq(articles.categoryId, categoryId)),
      columns: { id: true },
    });
    if (!clash) return slug;
    slug = `${base}-${n}`.slice(0, 255);
  }
  return `${base}-${Date.now()}`.slice(0, 255);
}

export async function ingestSource(db: AppDatabase, sourceId: number): Promise<IngestStats> {
  const src = await db.query.sources.findFirst({ where: eq(sources.id, sourceId) });
  if (!src) throw new Error(`مصدر غير موجود: ${sourceId}`);

  const stats: IngestStats = {
    source: src.name, fetched: 0, skippedDuplicate: 0,
    skippedShort: 0, generated: 0, failed: 0, errors: [],
  };

  const sections = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: [asc(categories.sortOrder)],
  });
  const allowedSlugs = sections.map((s) => s.slug);
  const sectionId = new Map(sections.map((s) => [s.slug, s.id]));

  let items;
  try {
    items = await fetchFeed(src.feedUrl);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await db.update(sources).set({ lastError: msg.slice(0, 500), lastFetchedAt: new Date() })
      .where(eq(sources.id, sourceId));
    stats.errors.push(`فشل جلب التغذية: ${msg}`);
    return stats;
  }

  stats.fetched = items.length;

  // كاتب افتراضي للمحتوى المُولَّد — يُفترض وجود كاتب واحد على الأقل
  const firstAuthor = await db.query.authors.findFirst({ columns: { id: true } });
  if (!firstAuthor) {
    stats.errors.push("لا يوجد كاتب في قاعدة البيانات");
    return stats;
  }

  let processed = 0;
  for (const item of items) {
    if (processed >= MAX_PER_RUN) break;

    const dup = await db.query.articles.findFirst({
      where: eq(articles.sourceGuid, item.guid),
      columns: { id: true },
    });
    if (dup) { stats.skippedDuplicate++; continue; }

    if (item.raw.trim().length < 200) { stats.skippedShort++; continue; }

    const gen = await generateArticle({
      raw: item.raw,
      sourceTitle: item.title,
      allowedSlugs,
    });
    processed++;

    if (!gen.ok) {
      stats.failed++;
      stats.errors.push(`${item.title.slice(0, 60)}: ${gen.error}`);
      continue;
    }

    const a = gen.article;
    const catId = sectionId.get(a.category_slug) ?? src.defaultCategoryId ?? sections[0]?.id;
    if (!catId) { stats.failed++; stats.errors.push("تعذّر تحديد القسم"); continue; }

    const slug = await uniqueSlug(db, normalizeSlug(a.permalink), catId);
    const useImage = src.allowSourceImages && item.imageUrl;

    await db.insert(articles).values({
      // القصّ عند حدّ الكلمة — slice الحرفي يفسد العربية
      title: trimAtWord(a.title, 70),
      slug,
      excerpt: trimAtWord(a.meta_description, 160),
      content: toMarkdown(a),
      isMarkdown: true,
      cover: coverFor(slug),
      // بوابة المراجعة البشرية — لا نشر تلقائي إلا بعلم صريح
      status: AUTOPUBLISH ? "published" : "draft",
      publishedAt: AUTOPUBLISH ? (item.publishedAt ?? new Date()) : null,
      aiModel: gen.model,
      sourceId: src.id,
      sourceGuid: item.guid,
      sourceUrl: item.link,
      sourceName: src.name,
      sourceRaw: item.raw.slice(0, 60_000),
      imageUrl: useImage ? item.imageUrl : null,
      imageAlt: useImage ? trimAtWord(a.alt_text, 130) : null,
      imageCredit: useImage ? src.name.slice(0, 300) : null,
      authorId: firstAuthor.id,
      categoryId: catId,
    });

    const inserted = await db.query.articles.findFirst({
      where: eq(articles.sourceGuid, item.guid),
      columns: { id: true },
    });
    if (inserted) {
      const tagIds = await resolveTagIds(db, a.tags);
      if (tagIds.length) {
        await db.insert(articleTags).values(
          tagIds.map((tagId) => ({ articleId: inserted.id, tagId })),
        );
      }
    }

    stats.generated++;
  }

  await db.update(sources).set({ lastFetchedAt: new Date(), lastError: null })
    .where(eq(sources.id, sourceId));

  return stats;
}

export async function ingestAllActive(db: AppDatabase): Promise<IngestStats[]> {
  const active = await db.query.sources.findMany({ where: eq(sources.isActive, true) });
  const out: IngestStats[] = [];
  for (const s of active) {
    try {
      out.push(await ingestSource(db, s.id));
    } catch (error) {
      out.push({
        source: s.name, fetched: 0, skippedDuplicate: 0, skippedShort: 0,
        generated: 0, failed: 1,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  }
  return out;
}
