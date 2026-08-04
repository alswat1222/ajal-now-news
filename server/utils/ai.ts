import { Mistral } from "@mistralai/mistralai";

/**
 * توليد خبر منظَّم من نص خام عبر Mistral.
 *
 * مبدأ الحماية الأساسي: النموذج **يعيد صياغة** ما ورد في النص الخام ولا يضيف
 * وقائع أو أرقاماً أو أسماء. لذلك نحفظ النص الخام مع كل مقال (`sourceRaw`)
 * ليكون التدقيق ممكناً، ونضع كل مخرَج في حالة `draft` بانتظار مراجعة بشرية.
 */

export type AiSection = { heading: string; content: string };

export type AiArticle = {
  permalink: string;
  title: string;
  meta_description: string;
  alt_text: string;
  tags: string[];
  category_slug: string;
  content: { introduction: string; sections: AiSection[] };
};

/** مخطّط المخرجات — بنية موحّدة تُلزم النموذج بها */
const NEWS_SCHEMA = {
  title: "News Article Schema",
  description: "A structured schema for generating professional news articles with SEO optimization.",
  type: "object",
  required: [
    "permalink",
    "title",
    "meta_description",
    "alt_text",
    "tags",
    "category_slug",
    "content",
  ],
  properties: {
    permalink: {
      type: "string",
      maxLength: 100,
      description: "URL slug in English, lowercase, hyphen-separated. ASCII only.",
    },
    // ⚠️ لا maxLength على الحقول النصية العربية عمداً.
    // الحد الصارم في المخطّط يقصّ على مستوى **الحرف** فينتج كلمات فاسدة:
    // «الإعلام» + «سمي» ← «الإعلامسمي» · «غير نظامية» ← «غيرظامة».
    // الطول يُفرَض بالتعليمات ويُقصّ في الكود عند حدّ الكلمة لا الحرف.
    title: {
      type: "string",
      description: "The main headline (H1) in Arabic. MUST be a complete sentence under 60 characters.",
    },
    meta_description: {
      type: "string",
      description: "Meta description for SEO in Arabic, one complete engaging sentence under 155 characters.",
    },
    alt_text: {
      type: "string",
      description: "Alternative text for the featured image in Arabic, complete phrase under 120 characters.",
    },
    tags: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string", maxLength: 30 },
      description: "3 to 5 Arabic tags/keywords.",
    },
    category_slug: {
      type: "string",
      maxLength: 40,
      description: "One section slug chosen from the allowed list provided in the instructions.",
    },
    content: {
      type: "object",
      required: ["introduction", "sections"],
      properties: {
        introduction: {
          type: "string",
          description: "Lead paragraph in Arabic summarizing the 5W1H.",
        },
        sections: {
          type: "array",
          items: {
            type: "object",
            required: ["heading", "content"],
            properties: {
              heading: { type: "string", description: "Section heading text (no markdown hashes)." },
              content: { type: "string", description: "Section body in Markdown, short paragraphs." },
            },
          },
        },
      },
    },
  },
  additionalProperties: false,
} as const;

function buildInstructions(allowedSlugs: string[]): string {
  return `أنت رئيس تحرير رقمي وصحفي متمرس وخبير في تحسين محركات البحث للمحتوى العربي.
مهمتك صياغة خبر رسمي احترافي من النص الخام المزوَّد.

### 1. ضوابط المحتوى (حاسمة — مخالفتها تُبطل المخرَج)
- **الالتزام الحرفي بالمعطيات:** يُمنع منعاً باتاً اختلاق أو إضافة أي معلومة أو رقم أو اسم أو تاريخ أو اقتباس غير مذكور صراحةً في النص الخام.
- إن كانت معلومة ما ناقصة، **اترك الخبر دونها** ولا تستنتجها ولا تكملها من معرفتك العامة.
- **الموضوعية:** نبرة إخبارية رسمية محايدة، بلا مبالغة عاطفية ولا رأي شخصي.
- لا تنسب تصريحاً لأحد ما لم يرد نصّه في المصدر.

### 2. البيانات الوصفية
- استخلص الكلمة المفتاحية الأساسية من النص وركّز عليها.
- العنوان (H1): جذاب رسمي ≤ 60 حرفاً، والكلمة المفتاحية في نصفه الأول.
- الوصف التعريفي: ≤ 155 حرفاً، يتضمن الكلمة المفتاحية وفعلاً محفّزاً على القراءة.
- الرابط الدائم: بالإنجليزية، حروف صغيرة، مفصول بشرطات، بلا حروف عربية.

### 3. الهيكلة
- المقدمة بأسلوب الهرم المقلوب تُجيب: مَن، ماذا، أين، متى، لماذا.
- عناوين فرعية تقسّم النص، مع كلمات مفتاحية مرادفة بشكل طبيعي.
- فقرات قصيرة جداً (سطران إلى ثلاثة) لسهولة القراءة على الهاتف.
- استخدم **الخط العريض** لإبراز الأسماء والأرقام والكلمة المفتاحية (مرتين كحد أقصى).
- استخدم النقاط إذا تضمّن النص قوائم أو خطوات.

### 4. التصنيف
اختر قسماً واحداً فقط من هذه القائمة حصراً لحقل category_slug:
${allowedSlugs.join(" · ")}
إن لم يناسب أيٌّ منها بوضوح، اختر الأقرب موضوعياً.

### 5. النص البديل للصورة
اقترح وصفاً دقيقاً لصورة الخبر يتضمن الكلمة المفتاحية.

أعد المخرجات وفق مخطّط JSON المحدّد حصراً، بلا أي نص خارجه.`;
}

export type GenerateInput = {
  raw: string;
  sourceTitle?: string;
  allowedSlugs: string[];
};

export type GenerateResult =
  | { ok: true; article: AiArticle; model: string }
  | { ok: false; error: string };

const MODEL = "mistral-large-latest";

export async function generateArticle(input: GenerateInput): Promise<GenerateResult> {
  const apiKey = process.env.MISTRAL_API_KEY ?? "";
  if (!apiKey) return { ok: false, error: "MISTRAL_API_KEY غير مضبوط" };

  const raw = input.raw.trim();
  // النموذج لا يستطيع الالتزام بالمعطيات إن لم تكن هناك معطيات كافية أصلاً
  if (raw.length < 200) {
    return { ok: false, error: `النص الخام قصير جداً (${raw.length} حرفاً) — يُرفض لتجنّب الاختلاق` };
  }

  const client = new Mistral({ apiKey });

  try {
    const res = await client.chat.complete({
      model: MODEL,
      temperature: 0.3, // منخفضة عمداً: المطلوب أمانة للنص لا إبداع
      maxTokens: 3016,
      topP: 1,
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "news_article",
          schemaDefinition: NEWS_SCHEMA as unknown as Record<string, unknown>,
          strict: true,
        },
      },
      messages: [
        { role: "system", content: buildInstructions(input.allowedSlugs) },
        {
          role: "user",
          content: `${input.sourceTitle ? `العنوان الأصلي: ${input.sourceTitle}\n\n` : ""}النص الخام:\n\n${raw}`,
        },
      ],
    });

    const content = res.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content : JSON.stringify(content);
    if (!text) return { ok: false, error: "استجابة فارغة من النموذج" };

    const parsed = JSON.parse(text) as AiArticle;

    // تحقّق دفاعي: النموذج قد يخالف المخطّط رغم strict
    if (!parsed.title || !parsed.permalink || !parsed.content?.introduction) {
      return { ok: false, error: "المخرَج ناقص الحقول الإلزامية" };
    }
    if (!input.allowedSlugs.includes(parsed.category_slug)) {
      return { ok: false, error: `قسم غير معروف: ${parsed.category_slug}` };
    }

    return { ok: true, article: parsed, model: MODEL };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ai] generateArticle failed:", msg);
    return { ok: false, error: msg };
  }
}

/** يحوّل مخرَج النموذج إلى نص Markdown واحد جاهز للتخزين */
export function toMarkdown(a: AiArticle): string {
  const parts = [a.content.introduction.trim()];
  for (const s of a.content.sections ?? []) {
    parts.push(`## ${s.heading.replace(/^#+\s*/, "").trim()}`);
    parts.push(s.content.trim());
  }
  return parts.filter(Boolean).join("\n\n");
}

/**
 * قصّ عند حدّ الكلمة لا الحرف.
 * القصّ الحرفي في العربية يلصق بقايا الكلمات ببعضها فينتج نصاً فاسداً،
 * وهو ما كان يفعله maxLength في مخطّط JSON.
 */
export function trimAtWord(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const cut = t.slice(0, max + 1);
  const lastSpace = cut.lastIndexOf(" ");
  const out = (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : t.slice(0, max)).trim();
  // إزالة علامات ترقيم معلّقة في النهاية بعد القصّ
  return out.replace(/[\s،,:؛;\-—«»"'(]+$/u, "");
}

/** ينظّف الـslug: ASCII، حروف صغيرة، شرطات فقط */
export function normalizeSlug(input: string): string {
  const s = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  // إن بقيت حروف غير لاتينية، نستبدلها بترميز آمن للمسار
  return /^[a-z0-9-]+$/.test(s) ? s : encodeURIComponent(s).replace(/%/g, "").slice(0, 100);
}
