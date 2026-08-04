import { asc, eq } from "drizzle-orm";
import { categories } from "../../../db/schema";

// ─── الأقسام للتنقّل ────────────────────────────
export default defineEventHandler(async (event) => {
  // الأقسام نادرة التغيّر — تخزين أطول
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");

  return withDb(event, "news.categories", (db) =>
    db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.sortOrder), asc(categories.id)],
    }),
  );
});
