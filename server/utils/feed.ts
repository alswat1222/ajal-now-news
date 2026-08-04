import Parser from "rss-parser";

/**
 * قراءة تغذيات RSS/Atom واستخراج نص خام وصورة لكل مُدخَل.
 *
 * ⚠️ الصور: الرابط المُستخرَج يعود لناشر المصدر. لا يُستعمل إلا إذا فُعِّل
 * `allowSourceImages` للمصدر صراحةً، وتبقى مسؤولية الترخيص على المالك.
 */

type FeedCustom = {
  "media:content"?: { $?: { url?: string; medium?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
  "content:encoded"?: string;
};

const parser: Parser<Record<string, unknown>, FeedCustom> = new Parser({
  timeout: 20_000,
  headers: { "User-Agent": "ajel-now-bot/1.0 (+https://ajel-now.net)" },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
});

export type FeedItem = {
  guid: string;
  title: string;
  link: string;
  raw: string;
  imageUrl?: string;
  publishedAt?: Date;
};

/** ينزع وسوم HTML ويفكّ الكيانات الأساسية ويضغط المسافات */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** أول صورة في متن HTML — بديل حين لا توفّر التغذية حقل وسائط */
function firstImageFromHtml(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const url = m?.[1];
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

export async function fetchFeed(feedUrl: string): Promise<FeedItem[]> {
  const feed = await parser.parseURL(feedUrl);

  return (feed.items ?? []).flatMap((item) => {
    const link = (item.link ?? "").trim();
    const title = (item.title ?? "").trim();
    if (!link || !title) return [];

    const html = item["content:encoded"] ?? item.content ?? item.contentSnippet ?? "";
    const raw = stripHtml(String(html));

    const imageUrl =
      item["media:content"]?.$?.url ??
      item["media:thumbnail"]?.$?.url ??
      (item.enclosure?.type?.startsWith("image/") ? item.enclosure.url : undefined) ??
      firstImageFromHtml(String(html));

    const dateStr = item.isoDate ?? item.pubDate;
    const publishedAt = dateStr ? new Date(dateStr) : undefined;

    return [{
      // guid المصدر هو حارس التكرار الأساسي؛ الرابط بديل حين يغيب
      guid: String(item.guid ?? link).slice(0, 500),
      title,
      link,
      raw,
      imageUrl: imageUrl && /^https?:\/\//i.test(imageUrl) ? imageUrl : undefined,
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : undefined,
    }];
  });
}
