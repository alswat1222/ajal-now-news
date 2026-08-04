import { and, asc, desc, eq } from "drizzle-orm";
import { articles, categories } from "../../../db/schema";

// ─── بيانات الصفحة الرئيسية دفعة واحدة ─────────
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");

  return withDb(event, "news.home", async (db) => {
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
        where: eq(categories.isActive, true),
        orderBy: [asc(categories.sortOrder), asc(categories.id)],
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
  });
});
