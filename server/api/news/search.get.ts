import { z } from "zod";
import { and, desc, like, or } from "drizzle-orm";
import { articles } from "../../../db/schema";

const querySchema = z.object({
  q: z.string().min(2).max(100),
});

// ─── بحث ───────────────────────────────────────
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }

  // نتائج البحث شخصية وقصيرة العمر — لا تُخزَّن على الوسطاء
  setHeader(event, "Cache-Control", "no-store");

  const pattern = `%${parsed.data.q}%`;

  return withDb(event, "news.search", (db) =>
    db.query.articles.findMany({
      where: and(
        published,
        or(like(articles.title, pattern), like(articles.excerpt, pattern)),
      ),
      orderBy: [desc(articles.publishedAt)],
      limit: 20,
      with: articleWith,
    }),
  );
});
