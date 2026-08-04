import { z } from "zod";
import { eq } from "drizzle-orm";
import { categories, sources } from "../../../db/schema";

const bodySchema = z.object({
  name: z.string().min(2).max(200),
  feedUrl: z.string().url().max(1000),
  siteUrl: z.string().url().max(1000).optional(),
  defaultCategorySlug: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  // ⚠️ إعادة نشر صور المصدر — قرار المالك ومسؤوليته القانونية
  allowSourceImages: z.boolean().default(false),
});

// إضافة مصدر تغذية
export default defineEventHandler(async (event) => {
  requireAdmin(event);
  setHeader(event, "Cache-Control", "no-store");

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "معطيات غير صالحة",
      data: { issues: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) },
    });
  }
  const input = parsed.data;

  return withDb(event, "admin.sources.create", async (db) => {
    let defaultCategoryId: number | null = null;
    if (input.defaultCategorySlug) {
      const cat = await db.query.categories.findFirst({
        where: eq(categories.slug, input.defaultCategorySlug),
        columns: { id: true },
      });
      if (!cat) {
        throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "قسم افتراضي غير معروف" });
      }
      defaultCategoryId = cat.id;
    }

    const exists = await db.query.sources.findFirst({
      where: eq(sources.feedUrl, input.feedUrl),
      columns: { id: true },
    });
    if (exists) {
      throw createError({ statusCode: 409, statusMessage: "Conflict", message: "المصدر مضاف مسبقاً" });
    }

    await db.insert(sources).values({
      name: input.name,
      feedUrl: input.feedUrl,
      siteUrl: input.siteUrl ?? null,
      defaultCategoryId,
      isActive: input.isActive,
      allowSourceImages: input.allowSourceImages,
    });

    const created = await db.query.sources.findFirst({ where: eq(sources.feedUrl, input.feedUrl) });
    return created;
  });
});
