import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ─── الكتّاب ───────────────────────────────────
export const authors = mysqlTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 120 }),
  bio: text("bio"),
  initials: varchar("initials", { length: 8 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── التصنيفات ──────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
});

// ─── المقالات ───────────────────────────────────
export const articles = mysqlTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    excerpt: varchar("excerpt", { length: 1000 }).notNull(),
    content: text("content").notNull(),
    // غلاف مرسوم بالكود: مفتاح تدرّج لوني (red | navy | gold | teal | plum)
    cover: varchar("cover", { length: 20 }).notNull().default("navy"),
    status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
    isBreaking: boolean("is_breaking").notNull().default(false),
    isFeatured: boolean("is_featured").notNull().default(false),
    viewsCount: int("views_count").notNull().default(0),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    authorId: bigint("author_id", { mode: "number", unsigned: true }).notNull(),
    categoryId: bigint("category_id", { mode: "number", unsigned: true }).notNull(),
  },
  (t) => [
    uniqueIndex("slug_category_idx").on(t.slug, t.categoryId),
    index("status_published_idx").on(t.status, t.publishedAt),
    index("breaking_idx").on(t.isBreaking, t.publishedAt),
  ],
);

// ─── الوسوم ─────────────────────────────────────
export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const articleTags = mysqlTable("article_tags", {
  id: serial("id").primaryKey(),
  articleId: bigint("article_id", { mode: "number", unsigned: true }).notNull(),
  tagId: bigint("tag_id", { mode: "number", unsigned: true }).notNull(),
});

// ─── الأنواع المستنتجة ─────────────────────────
export type Author = typeof authors.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Tag = typeof tags.$inferSelect;
