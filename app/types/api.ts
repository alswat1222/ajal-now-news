import type { InternalApi } from "nitropack/types";

/**
 * أنواع الواجهة مشتقّة من مسارات Nitro نفسها (سجل InternalApi المولَّد).
 *
 * يقابل ما كان يفعله `contracts/types.ts` في نسخة React عبر
 * `inferRouterOutputs<AppRouter>` من tRPC: مصدر حقيقة واحد، فإن تغيّر
 * استعلام في الخادم انكسر النوع في الواجهة فوراً بدل أن يمر صامتاً.
 *
 * ملاحظة: هذه أنواع فقط — لا يُحزَّم أي كود خادم في حزمة العميل.
 * الأنواع مارّة عبر `Serialize` أي أنها تعكس شكل JSON بعد النقل
 * (التواريخ تصل كسلاسل نصية، لا كائنات Date).
 *
 * تعيش في `app/` لا في `shared/` لأن سياق أنواع `shared/` لا يشمل
 * `.nuxt/types/nitro-routes.d.ts` الذي يوسّع `InternalApi`.
 */

export type HomeData = InternalApi["/api/news/home"]["get"];
export type ArticleListItem = HomeData["latest"][number];
export type BreakingItem = HomeData["breaking"][number];
export type MostReadItem = HomeData["mostRead"][number];
export type HomeCategoryBlock = HomeData["categories"][number];

export type ArticleFull = InternalApi["/api/news/article"]["get"];
export type CategoryPageData = InternalApi["/api/news/category"]["get"];
export type CategoryItem = InternalApi["/api/news/categories"]["get"][number];
export type SearchResults = InternalApi["/api/news/search"]["get"];
export type RelatedArticles = InternalApi["/api/news/related"]["get"];
