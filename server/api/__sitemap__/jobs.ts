import { and, desc, eq, gt } from "drizzle-orm";
import { jobs } from "../../../db/schema";

/**
 * مصدر خريطة الوظائف — الوظائف السارية فقط.
 * إدراج إعلان منتهٍ يُفشل تحقّق Google للوظائف ويضرّ ثقة النطاق.
 */
export default defineSitemapEventHandler(async (event) => {
  try {
    const db = getDb(event);

    const list = await db.query.jobs.findMany({
      where: and(eq(jobs.status, "published"), gt(jobs.validThrough, new Date())),
      orderBy: [desc(jobs.postedAt)],
      columns: { slug: true, updatedAt: true },
      limit: 5000,
    });

    return [
      { loc: "/jobs", changefreq: "hourly" as const, priority: 0.8 as const },
      ...list.map((j) => ({
        loc: `/jobs/${j.slug}`,
        lastmod: j.updatedAt?.toISOString(),
        changefreq: "daily" as const,
        priority: 0.7 as const,
      })),
    ];
  } catch (error) {
    console.error("[sitemap] jobs source failed:", error);
    return [];
  }
});
