import { and, eq, gt } from "drizzle-orm";
import { jobs } from "../../../db/schema";

// ─── وظيفة واحدة ────────────────────────────────
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") ?? "";
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request", message: "معطيات غير صالحة" });
  }

  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=600, stale-while-revalidate=1800");

  const job = await withDb(event, "jobs.single", (db) =>
    db.query.jobs.findFirst({
      where: and(
        eq(jobs.slug, slug),
        eq(jobs.status, "published"),
        // الوظيفة المنتهية تُعامَل كغير موجودة: إبقاؤها ظاهرة يضلّل الباحث
        // ويخالف سياسة Google للوظائف.
        gt(jobs.validThrough, new Date()),
      ),
    }),
  );

  if (!job) {
    throw createError({ statusCode: 404, statusMessage: "Not Found", message: "الوظيفة غير متاحة" });
  }

  return {
    ...job,
    descriptionHtml: renderMarkdown(job.description),
  };
});
