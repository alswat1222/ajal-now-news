import { eq } from "drizzle-orm";
import { articles } from "../../db/schema";

/** شرط النشر المشترك لكل استعلامات المقالات */
export const published = eq(articles.status, "published");

/** أعمدة العلاقات المرافقة للمقال */
export const articleWith = {
  author: { columns: { name: true, role: true, initials: true, bio: true } },
  category: { columns: { name: true, slug: true } },
} as const;
