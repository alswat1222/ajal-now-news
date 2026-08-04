import { z } from "zod";

const bodySchema = z.object({ sourceId: z.coerce.number().int().optional() }).default({});

// تشغيل خط الابتلاع — لمصدر واحد أو لكل المصادر النشطة
export default defineEventHandler(async (event) => {
  requireAdmin(event);
  setHeader(event, "Cache-Control", "no-store");

  const parsed = bodySchema.safeParse(await readBody(event).catch(() => ({})));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }

  return withDb(event, "admin.ingest", async (db) => {
    const stats = parsed.data.sourceId
      ? [await ingestSource(db, parsed.data.sourceId)]
      : await ingestAllActive(db);

    return {
      autopublish: process.env.INGEST_AUTOPUBLISH === "true",
      stats,
    };
  });
});
