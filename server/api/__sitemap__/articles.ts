import { and, desc, eq } from "drizzle-orm";
import { articles, categories } from "../../../db/schema";

/**
 * مصدر ديناميكي لخريطة المقالات والأقسام.
 * يستهلكه @nuxtjs/sitemap عبر `sitemap.sitemaps.articles.sources`.
 */
export default defineSitemapEventHandler(async (event) => {
  try {
    const db = getDb(event);

    const [cats, list] = await Promise.all([
      db.query.categories.findMany(),
      db.query.articles.findMany({
        where: eq(articles.status, "published"),
        orderBy: [desc(articles.publishedAt)],
        columns: { slug: true, publishedAt: true, updatedAt: true },
        with: { category: { columns: { slug: true } } },
        // حدّ خريطة الموقع الواحدة 50,000 رابط — نبقى دونه بأمان
        limit: 45_000,
      }),
    ]);

    // شكل موحَّد للمُدخَلات، و lastmod نصّ ISO لا كائن Date — الوحدة تتوقع string
    type Entry = {
      loc: string;
      lastmod?: string;
      changefreq: "hourly" | "daily";
      // الوحدة تقبل قيماً حرفية فقط (0 · 0.1 … 1) لا `number` المطلق
      priority: 0.7 | 0.8;
    };

    const entries: Entry[] = [
      ...cats.map((c) => ({
        loc: `/${c.slug}`,
        lastmod: undefined,
        changefreq: "hourly" as const,
        priority: 0.8 as const,
      })),
      ...list.map((a) => ({
        loc: `/${a.category.slug}/${a.slug}`,
        lastmod: (a.updatedAt ?? a.publishedAt)?.toISOString(),
        changefreq: "daily" as const,
        priority: 0.7 as const,
      })),
    ];

    return entries;
  } catch (error) {
    // تعطُّل قاعدة البيانات لا يجوز أن يُنتج خريطة معطوبة أو 500 —
    // نُرجع قائمة فارغة فتبقى الخريطة صالحة بنيوياً.
    console.error("[sitemap] articles source failed:", error);
    return [];
  }
});
