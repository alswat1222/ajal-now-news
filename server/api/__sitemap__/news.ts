import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import { articles } from "../../../db/schema";

/**
 * خريطة Google News — أهم قطعة SEO لموقع أخبار.
 *
 * قيود Google الصارمة:
 *  - آخر 48 ساعة فقط (ما قبلها يُتجاهل)
 *  - حد أقصى 1,000 رابط
 *  - كل مُدخَل يحتاج publication (name + language) وpublication_date وtitle
 *
 * ⚠️ دقة publication_date تعتمد على قراءة UTC صحيحة — راجع docs/OPERATIONS.md.
 * التواريخ المستقبلية تُرفض من Google، وهو ما كان يحدث قبل إجبار UTC على الاتصال.
 */
const WINDOW_HOURS = 48;
const MAX_URLS = 1000;

export default defineSitemapEventHandler(async (event) => {
  try {
    const db = getDb(event);
    const since = new Date(Date.now() - WINDOW_HOURS * 3_600_000);

    const list = await db.query.articles.findMany({
      where: and(
        eq(articles.status, "published"),
        isNotNull(articles.publishedAt),
        gte(articles.publishedAt, since),
      ),
      orderBy: [desc(articles.publishedAt)],
      columns: { title: true, slug: true, publishedAt: true },
      with: { category: { columns: { slug: true } } },
      limit: MAX_URLS,
    });

    return list.map((a) => ({
      loc: `/${a.category.slug}/${a.slug}`,
      news: {
        title: a.title,
        publication_date: a.publishedAt!,
        publication: { name: "عاجل الآن", language: "ar" },
      },
    }));
  } catch (error) {
    console.error("[sitemap] news source failed:", error);
    return [];
  }
});
