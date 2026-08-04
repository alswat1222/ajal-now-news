import { drizzle } from "drizzle-orm/mysql2";
import type { H3Event } from "h3";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";

/**
 * طبقة الاتصال بقاعدة البيانات — نسخة Nitro من `api/queries/connection.ts`.
 *
 * الفروق المقصودة عن الأصل:
 *  1. قراءة `DATABASE_URL` عبر `useRuntimeConfig()` (أسلوب Nitro) بدل `api/lib/env.ts`.
 *  2. رفع خطأ مُصنَّف عند غياب الإعداد بدل محاولة اتصال محكوم عليها بالفشل بعد ثوانٍ.
 *
 * ما بقي حرفياً: نفس السائق (`drizzle-orm/mysql2`)، نفس `mode: "planetscale"`،
 * نفس المخطط الكامل (schema + relations)، ونفس نمط المثيل الكسول المُعاد استعماله.
 */

const fullSchema = { ...schema, ...relations };

export type AppDatabase = ReturnType<typeof drizzle<typeof fullSchema>>;

let instance: AppDatabase | undefined;

/** خطأ داخلي يدل على أن طبقة البيانات غير متاحة — لا يُسرَّب نصه إلى العميل أبداً. */
export class DatabaseUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseUnavailableError";
  }
}

/**
 * `useRuntimeConfig()` قد لا يحمل المفتاح إن لم يُعلَن في `nuxt.config.ts`؛
 * لذلك نسقط بلطف إلى `process.env` (هدف النشر Node — المتغيّر متاح دائماً).
 */
function resolveDatabaseUrl(event?: H3Event): string {
  let fromRuntimeConfig = "";
  try {
    const config = useRuntimeConfig(event) as { databaseUrl?: string };
    fromRuntimeConfig = config?.databaseUrl ?? "";
  } catch {
    // خارج سياق Nitro (سكربت، اختبار) — نتابع إلى process.env
  }
  return fromRuntimeConfig || process.env.DATABASE_URL || "";
}

/** مثيل Drizzle كسول مُعاد استعماله عبر الطلبات (pool واحد لكل عملية). */
export function getDb(event?: H3Event): AppDatabase {
  if (!instance) {
    const url = resolveDatabaseUrl(event);
    if (!url) {
      throw new DatabaseUnavailableError(
        "DATABASE_URL is not configured (runtimeConfig.databaseUrl / process.env.DATABASE_URL)",
      );
    }
    // نفس استدعاء الأصل حرفياً: drizzle(<connection string>, { mode, schema })
    // ملاحظة مُتحقَّق منها: صيغة `drizzle({ connection: { uri, ... } })` معطوبة في
    // drizzle-orm 0.45 مع mysql2 (client.query is not a function) — لا تستعملها.
    instance = drizzle(url, { mode: "planetscale", schema: fullSchema });
  }
  return instance;
}

/** تمييز أخطاء h3 المقصودة (404/400) عن أعطال قاعدة البيانات. */
function isH3Error(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (("__h3_error__" in error && (error as { __h3_error__?: boolean }).__h3_error__ === true) ||
      typeof (error as { statusCode?: unknown }).statusCode === "number")
  );
}

/**
 * يُشغّل استعلاماً ويحوّل **أي** عطل في طبقة البيانات إلى 503.
 *
 * لماذا 503 وليس 404؟ لأن 404 تعني «المحتوى غير موجود» فتبدأ محرّكات البحث
 * بإزالة الصفحات من الفهرس؛ بينما 503 تعني «عد لاحقاً» فتُبقي الفهرسة كما هي.
 * الخلط بينهما يحوّل انقطاعاً مؤقتاً إلى خسارة فهرسة دائمة.
 *
 * فحوص «غير موجود» (404) تتم **خارج** هذه الدالة — بإرجاع `null` من `run`
 * ثم رمي 404 في المعالِج نفسه.
 */
export async function withDb<T>(
  event: H3Event,
  label: string,
  run: (db: AppDatabase) => Promise<T>,
): Promise<T> {
  try {
    return await run(getDb(event));
  } catch (error) {
    // خطأ h3 مقصود مرّ من الداخل — لا تُخفِه خلف 503
    if (isH3Error(error)) throw error;

    // السجل على الخادم فقط: رسائل Drizzle تحتوي نص SQL وبيانات الاتصال.
    console.error(`[db] ${label} failed:`, error);

    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      message: "خدمة البيانات غير متاحة مؤقتاً",
      data: { code: "DB_UNAVAILABLE" },
    });
  }
}
