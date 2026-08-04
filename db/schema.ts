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

// ─── الأقسام ────────────────────────────────────
// مسطّحة عمداً: كل قسم = مسار من مستوى واحد /{slug}. التفريع الموضوعي يتم بالوسوم.
export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  // ترتيب العرض في شريط التنقّل — تحكّم تحريري بلا اعتماد على ترتيب الإدخال
  sortOrder: int("sort_order").notNull().default(100),
  // هوية بصرية للقسم: مفتاح التدرّج (red | navy | gold | teal | plum)
  cover: varchar("cover", { length: 20 }).notNull().default("navy"),
  // إخفاء قسم من التنقّل دون حذفه
  isActive: boolean("is_active").notNull().default(true),
});

// ─── مصادر التغذية (RSS) ────────────────────────
export const sources = mysqlTable("sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  // 500 حرفاً وليس 1000: الفهرس الفريد مع utf8mb4 يحسب 4 بايت للحرف،
  // وحد MySQL للمفتاح 3072 بايت — أي 768 حرفاً كحد أقصى.
  feedUrl: varchar("feed_url", { length: 500 }).notNull().unique(),
  siteUrl: varchar("site_url", { length: 1000 }),
  // القسم الافتراضي إن تعذّر على النموذج التصنيف
  defaultCategoryId: bigint("default_category_id", { mode: "number", unsigned: true }),
  isActive: boolean("is_active").notNull().default(true),
  // ⚠️ إعادة نشر صور المصدر قد تنتهك حقوق الناشر — يُفعَّل لكل مصدر على حدة
  // وبمسؤولية المالك بعد التأكد من الترخيص.
  allowSourceImages: boolean("allow_source_images").notNull().default(false),
  lastFetchedAt: timestamp("last_fetched_at"),
  lastError: varchar("last_error", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
    // draft = بانتظار مراجعة بشرية · review = مُراجَع ومعتمد · published = منشور
    status: mysqlEnum("status", ["draft", "review", "published"]).notNull().default("draft"),

    // ── حقول خط الأتمتة ──
    // المحتوى بصيغة Markdown حين يأتي من النموذج
    isMarkdown: boolean("is_markdown").notNull().default(false),
    // النموذج المُولِّد — فارغ يعني تحريراً بشرياً
    aiModel: varchar("ai_model", { length: 100 }),
    sourceId: bigint("source_id", { mode: "number", unsigned: true }),
    // معرّف المُدخَل في التغذية — يمنع التكرار
    sourceGuid: varchar("source_guid", { length: 500 }),
    sourceUrl: varchar("source_url", { length: 1000 }),
    sourceName: varchar("source_name", { length: 200 }),
    // النص الخام كما ورد — للمراجعة والتدقيق ومقارنة ما أضافه النموذج
    sourceRaw: text("source_raw"),
    imageUrl: varchar("image_url", { length: 1000 }),
    imageAlt: varchar("image_alt", { length: 300 }),
    imageCredit: varchar("image_credit", { length: 300 }),
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
    // حارس التكرار: نفس المُدخَل من نفس التغذية لا يُبتلع مرتين
    uniqueIndex("source_guid_idx").on(t.sourceGuid),
    index("review_queue_idx").on(t.status, t.createdAt),
  ],
);

// ─── الوظائف ────────────────────────────────────
// جدول مستقل لا امتداد للمقالات: JobPosting يفرض حقولاً (جهة التوظيف،
// الموقع، تاريخ الانتهاء) لا معنى لها في المقال، وGoogle يزيل الإعلان
// من نتائج الوظائف إن نقص أيٌّ منها أو انتهت صلاحيته.
export const jobs = mysqlTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    // وصف المهام والمتطلبات بصيغة Markdown
    description: text("description").notNull(),
    excerpt: varchar("excerpt", { length: 500 }).notNull(),

    // ── جهة التوظيف (hiringOrganization) ──
    companyName: varchar("company_name", { length: 200 }).notNull(),
    companyUrl: varchar("company_url", { length: 500 }),
    companyLogo: varchar("company_logo", { length: 500 }),

    // ── الموقع (jobLocation / jobLocationType) ──
    isRemote: boolean("is_remote").notNull().default(false),
    city: varchar("city", { length: 120 }),
    region: varchar("region", { length: 120 }),
    country: varchar("country", { length: 2 }).notNull().default("SA"),

    // ── التفاصيل ──
    employmentType: mysqlEnum("employment_type", [
      "FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY", "INTERN", "VOLUNTEER", "PER_DIEM", "OTHER",
    ]).notNull().default("FULL_TIME"),
    // الراتب اختياري لكنه يرفع ظهور الإعلان في نتائج الوظائف
    salaryMin: int("salary_min"),
    salaryMax: int("salary_max"),
    salaryCurrency: varchar("salary_currency", { length: 3 }).notNull().default("SAR"),
    salaryUnit: mysqlEnum("salary_unit", ["HOUR", "DAY", "WEEK", "MONTH", "YEAR"])
      .notNull().default("MONTH"),
    experienceMonths: int("experience_months"),
    field: varchar("field", { length: 100 }),

    // ── التقديم ──
    applyUrl: varchar("apply_url", { length: 1000 }),
    applyEmail: varchar("apply_email", { length: 255 }),

    // ── الإدارة ──
    status: mysqlEnum("status", ["draft", "published", "expired"]).notNull().default("draft"),
    postedAt: timestamp("posted_at"),
    // إلزامي: Google يزيل الإعلانات منتهية الصلاحية ويعاقب على إبقائها
    validThrough: timestamp("valid_through").notNull(),
    viewsCount: int("views_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (t) => [
    index("jobs_status_posted_idx").on(t.status, t.postedAt),
    index("jobs_valid_idx").on(t.status, t.validThrough),
    index("jobs_field_idx").on(t.field),
  ],
);

// ─── الوسوم (المحاور) ───────────────────────────
// طبقة التصنيف الثانية — عابرة للأقسام. «الذكاء الاصطناعي» قد يظهر في تقنية واقتصاد معاً.
export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 300 }),
});

export const articleTags = mysqlTable("article_tags", {
  id: serial("id").primaryKey(),
  articleId: bigint("article_id", { mode: "number", unsigned: true }).notNull(),
  tagId: bigint("tag_id", { mode: "number", unsigned: true }).notNull(),
});

// ─── الأنواع المستنتجة ─────────────────────────
export type Source = typeof sources.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Author = typeof authors.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Tag = typeof tags.$inferSelect;
