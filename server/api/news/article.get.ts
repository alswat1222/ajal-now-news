import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { articles } from "../../../db/schema";

const querySchema = z.object({
  category: z.string().min(1),
  slug: z.string().min(1),
});

// ─── مقال واحد حسب القسم والـ slug ─────────────
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }
  const input = parsed.data;

  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  const article = await withDb(event, "news.article", (db) =>
    db.query.articles.findFirst({
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
    }),
  );

  // 404 حقيقية: المقال غير موجود. تختلف عن 503 التي ترفعها withDb عند عطل قاعدة البيانات.
  if (!article) {
    throw createError({ statusCode: 404, statusMessage: "Not Found", message: "المقال غير موجود" });
  }

  return article;
});
