import { z } from "zod";
import { eq } from "drizzle-orm";
import { jobs } from "../../../db/schema";

const bodySchema = z
  .object({
    title: z.string().min(5).max(255),
    slug: z.string().max(255).optional(),
    description: z.string().min(50),
    excerpt: z.string().min(20).max(500),

    companyName: z.string().min(2).max(200),
    companyUrl: z.string().url().max(500).optional(),
    companyLogo: z.string().url().max(500).optional(),

    isRemote: z.boolean().default(false),
    city: z.string().max(120).optional(),
    region: z.string().max(120).optional(),
    country: z.string().length(2).default("SA"),

    employmentType: z
      .enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY", "INTERN", "VOLUNTEER", "PER_DIEM", "OTHER"])
      .default("FULL_TIME"),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
    salaryCurrency: z.string().length(3).default("SAR"),
    salaryUnit: z.enum(["HOUR", "DAY", "WEEK", "MONTH", "YEAR"]).default("MONTH"),
    experienceMonths: z.coerce.number().int().min(0).max(600).optional(),
    field: z.string().max(100).optional(),

    applyUrl: z.string().url().max(1000).optional(),
    applyEmail: z.string().email().max(255).optional(),

    status: z.enum(["draft", "published"]).default("draft"),
    // أيام الصلاحية — Google يشترط validThrough ويسقط الإعلان بعدها
    validDays: z.coerce.number().int().min(1).max(180).default(30),
  })
  .refine((d) => d.isRemote || d.city || d.region, {
    message: "الوظيفة الحضورية تحتاج مدينة أو منطقة — jobLocation إلزامي في JobPosting",
  })
  .refine((d) => d.applyUrl || d.applyEmail, {
    message: "لا بد من وسيلة تقديم واحدة على الأقل",
  })
  .refine((d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin, {
    message: "الحد الأعلى للراتب أقل من الأدنى",
  });

// ─── إضافة وظيفة ────────────────────────────────
export default defineEventHandler(async (event) => {
  requireAdmin(event);
  setHeader(event, "Cache-Control", "no-store");

  const parsed = bodySchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "معطيات غير صالحة",
      data: { issues: parsed.error.issues.map((i) => `${i.path.join(".") || "—"}: ${i.message}`) },
    });
  }
  const d = parsed.data;

  return withDb(event, "admin.jobs.create", async (db) => {
    const base = normalizeSlug(d.slug ?? d.title) || "job";
    let slug = base;
    for (let n = 2; n < 50; n++) {
      const clash = await db.query.jobs.findFirst({ where: eq(jobs.slug, slug), columns: { id: true } });
      if (!clash) break;
      slug = `${base}-${n}`.slice(0, 255);
    }

    const now = new Date();
    const validThrough = new Date(now.getTime() + d.validDays * 86_400_000);

    await db.insert(jobs).values({
      title: d.title,
      slug,
      description: d.description,
      excerpt: d.excerpt,
      companyName: d.companyName,
      companyUrl: d.companyUrl ?? null,
      companyLogo: d.companyLogo ?? null,
      isRemote: d.isRemote,
      city: d.city ?? null,
      region: d.region ?? null,
      country: d.country.toUpperCase(),
      employmentType: d.employmentType,
      salaryMin: d.salaryMin ?? null,
      salaryMax: d.salaryMax ?? null,
      salaryCurrency: d.salaryCurrency.toUpperCase(),
      salaryUnit: d.salaryUnit,
      experienceMonths: d.experienceMonths ?? null,
      field: d.field ?? null,
      applyUrl: d.applyUrl ?? null,
      applyEmail: d.applyEmail ?? null,
      status: d.status,
      postedAt: d.status === "published" ? now : null,
      validThrough,
    });

    return await db.query.jobs.findFirst({ where: eq(jobs.slug, slug) });
  });
});
