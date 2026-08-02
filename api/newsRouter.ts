import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { articles, categories } from "@db/schema";
import { and, desc, eq, ne, or, like, sql } from "drizzle-orm";

const published = eq(articles.status, "published");

const articleWith = {
  author: { columns: { name: true, role: true, initials: true, bio: true } },
  category: { columns: { name: true, slug: true } },
} as const;

export const newsRouter = createRouter({
  // ─── بيانات الصفحة الرئيسية دفعة واحدة ─────────
  home: publicQuery.query(async () => {
    const db = getDb();

    const [breaking, hero, latest, cats, mostRead] = await Promise.all([
      db.query.articles.findMany({
        where: and(published, eq(articles.isBreaking, true)),
        orderBy: [desc(articles.publishedAt)],
        limit: 6,
        with: { category: { columns: { slug: true } } },
      }),
      db.query.articles.findMany({
        where: and(published, eq(articles.isFeatured, true)),
        orderBy: [desc(articles.publishedAt)],
        limit: 5,
        with: articleWith,
      }),
      db.query.articles.findMany({
        where: published,
        orderBy: [desc(articles.publishedAt)],
        limit: 8,
        with: articleWith,
      }),
      db.query.categories.findMany({
        with: {
          articles: {
            where: published,
            orderBy: [desc(articles.publishedAt)],
            limit: 4,
            with: articleWith,
          },
        },
      }),
      db.query.articles.findMany({
        where: published,
        orderBy: [desc(articles.viewsCount)],
        limit: 5,
        with: { category: { columns: { name: true, slug: true } } },
      }),
    ]);

    return { breaking, hero, latest, categories: cats, mostRead };
  }),

  // ─── مقال واحد حسب القسم والـ slug ─────────────
  article: publicQuery
    .input(z.object({ category: z.string().min(1), slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const article = await db.query.articles.findFirst({
        where: and(
          published,
          eq(articles.slug, input.slug),
          eq(
            articles.categoryId,
            sql`(SELECT id FROM categories WHERE slug = ${input.category})`,
          ),
        ),
        with: {
          ...articleWith,
          articleTags: { with: { tag: true } },
        },
      });
      return article ?? null;
    }),

  // ─── مقالات ذات صلة ────────────────────────────
  related: publicQuery
    .input(z.object({ categoryId: z.number(), excludeId: z.number() }))
    .query(({ input }) =>
      getDb().query.articles.findMany({
        where: and(
          published,
          eq(articles.categoryId, input.categoryId),
          ne(articles.id, input.excludeId),
        ),
        orderBy: [desc(articles.publishedAt)],
        limit: 4,
        with: articleWith,
      }),
    ),

  // ─── مقالات قسم معين ───────────────────────────
  byCategory: publicQuery
    .input(
      z.object({
        slug: z.string().min(1),
        limit: z.number().min(1).max(50).default(12),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
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

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(and(published, eq(articles.categoryId, category.id)));

      return { category, articles: list, total: Number(count) };
    }),

  // ─── بحث ───────────────────────────────────────
  search: publicQuery
    .input(z.object({ q: z.string().min(2).max(100) }))
    .query(({ input }) => {
      const pattern = `%${input.q}%`;
      return getDb().query.articles.findMany({
        where: and(
          published,
          or(like(articles.title, pattern), like(articles.excerpt, pattern)),
        ),
        orderBy: [desc(articles.publishedAt)],
        limit: 20,
        with: articleWith,
      });
    }),

  // ─── عدّاد المشاهدات ───────────────────────────
  view: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(articles)
        .set({ viewsCount: sql`${articles.viewsCount} + 1` })
        .where(eq(articles.id, input.id));
      return { ok: true };
    }),

  // ─── التصنيفات للهيدر ──────────────────────────
  categories: publicQuery.query(() =>
    getDb().query.categories.findMany(),
  ),
});
