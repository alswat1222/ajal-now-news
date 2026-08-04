// ─── التصنيفات للهيدر ──────────────────────────
// منقول من api/newsRouter.ts (news.categories)
export default defineEventHandler(async (event) => {
  // التصنيفات نادرة التغيّر — تخزين أطول
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");

  return withDb(event, "news.categories", (db) => db.query.categories.findMany());
});
