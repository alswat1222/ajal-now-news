import { desc, inArray } from "drizzle-orm";
import { articles } from "../../../db/schema";

// طابور المراجعة — المقالات المولَّدة بانتظار قرار بشري
export default defineEventHandler(async (event) => {
  requireAdmin(event);
  setHeader(event, "Cache-Control", "no-store");

  return withDb(event, "admin.queue", (db) =>
    db.query.articles.findMany({
      where: inArray(articles.status, ["draft", "review"]),
      orderBy: [desc(articles.createdAt)],
      limit: 100,
      columns: {
        id: true, title: true, slug: true, excerpt: true, status: true,
        aiModel: true, sourceName: true, sourceUrl: true, imageUrl: true,
        createdAt: true, content: true, sourceRaw: true,
      },
      with: { category: { columns: { name: true, slug: true } } },
    }),
  );
});
