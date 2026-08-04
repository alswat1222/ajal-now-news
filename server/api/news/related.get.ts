import { z } from "zod";
import { and, desc, eq, ne } from "drizzle-orm";
import { articles } from "../../../db/schema";

const querySchema = z.object({
  categoryId: z.coerce.number().int(),
  excludeId: z.coerce.number().int(),
});

// ─── مقالات ذات صلة ────────────────────────────
// منقول من api/newsRouter.ts (news.related)
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }
  const input = parsed.data;

  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");

  return withDb(event, "news.related", (db) =>
    db.query.articles.findMany({
      where: and(
        published,
        eq(articles.categoryId, input.categoryId),
        ne(articles.id, input.excludeId),
      ),
      orderBy: [desc(articles.publishedAt)],
      limit: 4,
      with: articleWith,
    }),
  );
});
