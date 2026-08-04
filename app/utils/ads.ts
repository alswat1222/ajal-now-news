/**
 * وحدات AdSense وتوزيعها.
 *
 * المعرّفات مركّزة هنا لا متناثرة في الصفحات: تغيير وحدة في لوحة الناشر
 * يصير تعديلاً في سطر واحد، ويبقى واضحاً أي موضع يخدم أي وحدة.
 * الحساب: ca-pub-3335862771619351
 */
export const AD_SLOTS = {
  /** شريط أفقي أعلى المحتوى — الرئيسية · الأقسام · الوظائف (ajel-0) */
  top: "1560748816",
  /** بين كتل القوائم — الرئيسية · الأقسام · الوظائف (ajel-1) */
  inFeed: "8361694956",
  /** داخل متن المقال أو وصف الوظيفة (agel-2) */
  inArticle: "7631333147",
  /** نهاية المحتوى قبل التذييل — المقال · الوظيفة (ajel-3) */
  end: "6425796756",
  /** العمود الجانبي في الرئيسية (ajel-4) */
  sidebar: "4868458496",
} as const;

/**
 * حدود الكتل من المستوى الأعلى في متن مقال مولَّد من Markdown.
 *
 * الشرط `(?=<…)` أساسي: القصّ لا يقع إلا حيث يلي `</p>` بدايةُ كتلة جديدة،
 * فلا يقع داخل `<blockquote><p>…</p></blockquote>` أو داخل عنصر قائمة
 * فيُنتج HTML مكسوراً في نصفَي الصفحة.
 */
const BLOCK_BOUNDARY = /<\/p>\s*(?=<(?:p|h2|h3|h4|ul|ol|blockquote|table|hr)\b)/gi;

/**
 * يقسم متن المقال إلى جزأين لإقحام وحدة إعلانية بينهما.
 *
 * يعيد جزءاً ثانياً فارغاً إذا كان المقال أقصر من أن يستوعب الإقحام —
 * إعلان وسط مقال من ثلاث فقرات يخالف نسبة المحتوى إلى الإعلان في سياسة
 * AdSense ويستدعي مراجعة يدوية للحساب.
 */
export function splitForAd(html: string | null | undefined): [string, string] {
  if (!html) return ["", ""];

  const cuts: number[] = [];
  for (const m of html.matchAll(BLOCK_BOUNDARY)) {
    if (m.index === undefined) continue;
    cuts.push(m.index + m[0].length);
  }

  // نافذة القصّ بين 25% و75% من الطول — خارجها يلتصق الإعلان بالمطلع أو الخاتمة
  const usable = cuts.filter((c) => c > html.length * 0.25 && c < html.length * 0.75);
  if (usable.length < 2) return [html, ""];

  const target = html.length * 0.45;
  const at = usable.reduce((best, c) => (Math.abs(c - target) < Math.abs(best - target) ? c : best));

  return [html.slice(0, at), html.slice(at)];
}
