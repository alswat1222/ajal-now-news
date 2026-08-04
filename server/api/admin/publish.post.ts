import { z } from "zod";
import { eq } from "drizzle-orm";
import { articles } from "../../../db/schema";

const bodySchema = z.object({
  id: z.coerce.number().int(),
  action: z.enum(["publish", "reject"]),
});

// اعتماد مقال مولَّد أو رفضه — القرار البشري الذي يفصل المسوّدة عن النشر
export default defineEventHandler(async (event) => {
  requireAdmin(event);
  setHeader(event, "Cache-Control", "no-store");

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }
  const { id, action } = parsed.data;

  return withDb(event, "admin.publish", async (db) => {
    const found = await db.query.articles.findFirst({
      where: eq(articles.id, id),
      columns: { id: true, status: true, publishedAt: true },
    });
    if (!found) {
      throw createError({ statusCode: 404, statusMessage: "Not Found", message: "المقال غير موجود" });
    }

    if (action === "reject") {
      // الرفض يُبقي السجل لتفادي إعادة ابتلاع نفس المُدخَل، ويخرجه من النشر
      await db.update(articles).set({ status: "draft", publishedAt: null })
        .where(eq(articles.id, id));
      return { id, status: "draft" };
    }

    await db.update(articles)
      .set({ status: "published", publishedAt: found.publishedAt ?? new Date() })
      .where(eq(articles.id, id));
    return { id, status: "published" };
  });
});
