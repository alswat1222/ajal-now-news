import { eq } from "drizzle-orm";
import { articles } from "../../db/schema";

/** شرط النشر المشترك — منقول حرفياً من api/newsRouter.ts */
export const published = eq(articles.status, "published");

/** أعمدة العلاقات المرافقة للمقال — منقولة حرفياً من api/newsRouter.ts */
export const articleWith = {
  author: { columns: { name: true, role: true, initials: true, bio: true } },
  category: { columns: { name: true, slug: true } },
} as const;
