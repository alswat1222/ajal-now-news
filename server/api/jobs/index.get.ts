import { z } from "zod";
import { and, desc, eq, gt } from "drizzle-orm";
import { jobs } from "../../../db/schema";

const querySchema = z.object({
  field: z.string().max(100).optional(),
  remote: z.enum(["1", "0"]).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ─── قائمة الوظائف السارية ──────────────────────
export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }
  const input = parsed.data;

  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=600, stale-while-revalidate=1800");

  return withDb(event, "jobs.list", async (db) => {
    // شرط السريان: منشورة **و** لم ينتهِ أجلها.
    // Google يزيل الإعلانات المنتهية من نتائج الوظائف ويعاقب على إبقائها ظاهرة.
    const live = and(
      eq(jobs.status, "published"),
      gt(jobs.validThrough, new Date()),
    );

    const where = input.field
      ? and(live, eq(jobs.field, input.field))
      : input.remote === "1"
        ? and(live, eq(jobs.isRemote, true))
        : live;

    const list = await db.query.jobs.findMany({
      where,
      orderBy: [desc(jobs.postedAt), desc(jobs.id)],
      limit: input.limit,
      offset: input.offset,
      columns: {
        id: true, title: true, slug: true, excerpt: true,
        companyName: true, companyLogo: true,
        isRemote: true, city: true, region: true, country: true,
        employmentType: true, salaryMin: true, salaryMax: true,
        salaryCurrency: true, salaryUnit: true, field: true,
        postedAt: true, validThrough: true,
      },
    });

    return list;
  });
});
