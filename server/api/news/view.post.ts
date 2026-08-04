import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { articles } from "../../../db/schema";

const bodySchema = z.object({ id: z.coerce.number().int() });

// ─── عدّاد المشاهدات ───────────────────────────
export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }

  setHeader(event, "Cache-Control", "no-store");

  await withDb(event, "news.view", (db) =>
    db
      .update(articles)
      .set({ viewsCount: sql`${articles.viewsCount} + 1` })
      .where(eq(articles.id, parsed.data.id)),
  );

  return { ok: true };
});
