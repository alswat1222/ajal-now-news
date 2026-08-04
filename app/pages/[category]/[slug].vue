<script setup lang="ts">
import { Eye } from "lucide-vue-next";

const route = useRoute();
const category = computed(() => String(route.params.category ?? ""));
const slug = computed(() => String(route.params.slug ?? ""));

const { data: article, error } = await useFetch("/api/news/article", {
  query: { category, slug },
});

// رمز الحالة الصحيح إلزامي لـ SEO:
// 404 = المقال غير موجود · 503 = عطل مؤقت في البيانات (لا يُزال من الفهرس)
if (error.value || !article.value) {
  const status = error.value?.statusCode === 404 ? 404 : (error.value?.statusCode ?? 404);
  throw createError({
    statusCode: status,
    statusMessage: status === 404 ? "Not Found" : "Service Unavailable",
    fatal: true,
  });
}

const a = computed(() => article.value!);

const { data: related } = await useFetch("/api/news/related", {
  query: {
    categoryId: computed(() => a.value.categoryId),
    excludeId: computed(() => a.value.id),
  },
  default: () => [],
});

const paragraphs = computed(() => a.value.content.split(/\n\n+/));
const lede = computed(() => paragraphs.value[0] ?? "");
const body = computed(() => paragraphs.value.slice(1));

// يعمل على الخادم والعميل — بديل window.location.href الذي ينهار في SSR
const url = useRequestURL();
const canonical = computed(() => `${url.origin}/${a.value.category.slug}/${a.value.slug}`);

useSeoMeta({
  title: () => a.value.title,
  description: () => a.value.excerpt,
  ogType: "article",
  ogTitle: () => a.value.title,
  ogDescription: () => a.value.excerpt,
  articlePublishedTime: () => a.value.publishedAt ?? undefined,
  articleModifiedTime: () => a.value.updatedAt ?? undefined,
  articleSection: () => a.value.category.name,
  articleAuthor: [a.value.author.name],
});

// NewsArticle + مسار التنقل — أساس الظهور في «الأخبار العاجلة» ونتائج Google News
useSchemaOrg([
  defineArticle({
    "@type": "NewsArticle",
    headline: () => a.value.title,
    description: () => a.value.excerpt,
    datePublished: () => a.value.publishedAt ?? undefined,
    dateModified: () => a.value.updatedAt ?? undefined,
    author: [{ name: a.value.author.name, description: a.value.author.bio ?? undefined }],
    // نوع articleSection في nuxt-schema-org معرَّف كـ `string[] & string` —
    // تقاطع لا تحققه أي قيمة. القيمة المُرسَلة صحيحة وفق مواصفة schema.org.
    articleSection: a.value.category.name as unknown as string[] & string,
    inLanguage: "ar",
  }),
  defineBreadcrumb({
    itemListElement: [
      { name: "الرئيسية", item: "/" },
      { name: a.value.category.name, item: `/${a.value.category.slug}` },
      { name: a.value.title },
    ],
  }),
]);

// عدّاد المشاهدات — مرة واحدة لكل مقال في الجلسة، على العميل فقط
onMounted(() => {
  const key = `viewed-${a.value.id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    $fetch("/api/news/view", { method: "POST", body: { id: a.value.id } }).catch(() => {
      /* العدّاد ليس حرجاً — لا تُزعج القارئ */
    });
  } catch {
    /* sessionStorage محجوب */
  }
});
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8">
    <article>
      <!-- مسار التنقل -->
      <nav aria-label="breadcrumb" class="flex items-center gap-2 text-sm text-muted-foreground">
        <NuxtLink to="/" class="hover:text-foreground">الرئيسية</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink
          :to="`/${a.category.slug}`"
          class="font-semibold text-brand-red hover:underline dark:text-brand-red-dark"
        >
          {{ a.category.name }}
        </NuxtLink>
      </nav>

      <header class="mt-5">
        <span
          v-if="a.isBreaking"
          class="mb-3 inline-flex items-center gap-1.5 bg-brand-red px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy"
        >
          <span class="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
          عاجل
        </span>
        <h1 class="font-headline text-3xl font-extrabold leading-[1.35] md:text-4xl md:leading-[1.3]">
          {{ a.title }}
        </h1>

        <div
          class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground"
        >
          <span class="flex items-center gap-2">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy font-headline text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy"
            >
              {{ a.author.initials }}
            </span>
            <span class="font-bold text-foreground">{{ a.author.name }}</span>
            <span v-if="a.author.role" class="hidden sm:inline">— {{ a.author.role }}</span>
          </span>
          <time :datetime="a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined">
            {{ formatDate(a.publishedAt) }}
          </time>
          <span class="flex items-center gap-1">
            <Eye class="h-4 w-4" />
            {{ formatViews(a.viewsCount) }} مشاهدة
          </span>
          <span class="ms-auto text-xs">{{ timeAgo(a.publishedAt) }}</span>
        </div>
      </header>

      <Cover
        :cover="a.cover"
        :category-name="a.category.name"
        class="mt-6 aspect-[16/9] w-full"
      />

      <!-- المتن -->
      <!-- المحتوى المولَّد: HTML مُعقَّم على الخادم (marked + DOMPurify) -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="a.contentHtml" class="article-body mt-8" v-html="a.contentHtml" />
      <div v-else class="mt-8">
        <p
          class="font-headline text-lg font-semibold leading-[1.9] text-foreground md:text-xl md:leading-[1.9]"
        >
          {{ lede }}
        </p>
        <div class="mt-6 space-y-6 text-[17px] leading-[2] text-foreground/85">
          <p v-for="(p, i) in body" :key="i">{{ p }}</p>
        </div>
      </div>

      <!-- إسناد المصدر — إلزامي للمحتوى المُعاد صياغته -->
      <aside
        v-if="a.sourceUrl"
        class="mt-8 rounded-md border border-border bg-secondary/40 p-4 text-sm"
      >
        <p class="text-muted-foreground">
          صيغ هذا الخبر استناداً إلى تقرير
          <a
            :href="a.sourceUrl"
            target="_blank"
            rel="noopener nofollow"
            class="font-bold text-brand-red hover:underline dark:text-brand-red-dark"
          >{{ a.sourceName || "المصدر الأصلي" }}</a>.
          <!-- إفصاح دقيق: لا يُدّعى وجود مراجعة بشرية ما لم تحدث فعلاً -->
          <span v-if="a.aiModel">أُعدّت الصياغة آلياً بمساعدة الذكاء الاصطناعي.</span>
        </p>
      </aside>

      <!-- الوسوم -->
      <footer v-if="a.articleTags.length" class="mt-10 flex flex-wrap gap-2">
        <span
          v-for="{ tag } in a.articleTags"
          :key="tag.id"
          class="rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground"
        >
          #{{ tag.name }}
        </span>
      </footer>

      <div class="mt-8">
        <ShareButtons :url="canonical" :title="a.title" />
      </div>
    </article>

    <!-- مقالات ذات صلة -->
    <aside v-if="related.length" class="mt-14" aria-label="مقالات ذات صلة">
      <h2 class="rule-double pt-2 font-headline text-2xl font-extrabold">مقالات ذات صلة</h2>
      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        <ArticleCard v-for="r in related" :key="r.id" :article="r" />
      </div>
    </aside>
  </main>
</template>
