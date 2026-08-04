/**
 * رؤوس التخزين لصفحات HTML المُقدَّمة من الخادم.
 *
 * `public, max-age=0, s-maxage=21600`
 *   max-age=0   → المتصفح لا يخزّن، يعيد التحقّق في كل زيارة
 *   s-maxage=6h → Cloudflare يخدم من الحافة ولا يلمس الأصل
 *
 * يُستعمل خطاف `render:response` لا `routeRules` لأنه يطال صفحات HTML
 * وحدها، فلا يدهس رؤوس مسارات /api/* المضبوطة لكل مسار على حدة
 * (بعضها no-store وبعضها stale-while-revalidate).
 *
 * ⚠️ أثر على الحداثة: الخبر الجديد قد لا يظهر للزوار حتى 6 ساعات ما لم
 * تُفرَّغ ذاكرة Cloudflare. لموقع أخبار يجب إفراغها عند كل نشر.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("render:response", (response, { event }) => {
    // 200 فقط: تخزين 404 أو 503 ست ساعات على الحافة يحوّل عطلاً عابراً
    // إلى انقطاع ممتد يصعب تشخيصه.
    if (event.node.res.statusCode !== 200) return;

    response.headers = response.headers ?? {};
    response.headers["cache-control"] = "public, max-age=0, s-maxage=21600";
  });
});
