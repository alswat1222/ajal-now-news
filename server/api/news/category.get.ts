import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { articles, categories } from "../../../db/schema";

const querySchema = z.object({
  slug: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

// ─── مقالات قسم معين ───────────────────────────
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }
  const input = parsed.data;

  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const result = await withDb(event, "news.byCategory", async (db) => {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, input.slug),
    });
    if (!category) return null;

    const list = await db.query.articles.findMany({
      where: and(published, eq(articles.categoryId, category.id)),
      orderBy: [desc(articles.publishedAt)],
      limit: input.limit,
      offset: input.offset,
      with: articleWith,
    });

    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(and(published, eq(articles.categoryId, category.id)));

    return { category, articles: list, total: Number(countRows[0]?.count ?? 0) };
  });

  // 404 حقيقية: القسم غير موجود — لا تُخلط مع 503 لعطل قاعدة البيانات.
  if (!result) {
    throw createError({ statusCode: 404, statusMessage: "Not Found", message: "القسم غير موجود" });
  }

  return result;
});
