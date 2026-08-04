import type { H3Event } from "h3";

/**
 * حارس مسارات الإدارة — رمز واحد في ترويسة Authorization.
 * غياب الرمز في البيئة يعني **إغلاق** المسارات لا فتحها: الافتراض الآمن.
 */
export function requireAdmin(event: H3Event): void {
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (!expected) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      message: "واجهة الإدارة غير مُهيّأة",
    });
  }

  const header = getHeader(event, "authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  // مقارنة ثابتة الزمن — تمنع استنتاج الرمز من فروق التوقيت
  if (token.length !== expected.length || !timingSafeEqual(token, expected)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "غير مصرّح" });
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
