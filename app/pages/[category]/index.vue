<script setup lang="ts">
const PAGE_SIZE = 12;

const route = useRoute();
const slug = computed(() => String(route.params.category ?? ""));
const limit = ref(PAGE_SIZE);

// إعادة الضبط عند تغيّر القسم
watch(slug, () => {
  limit.value = PAGE_SIZE;
});

const { data, status, error } = await useFetch("/api/news/category", {
  query: { slug, limit, offset: 0 },
});

// 404 حقيقية للقسم غير الموجود · 503 لعطل البيانات — لا خلط بينهما
if (error.value || !data.value) {
  const code = error.value?.statusCode ?? 404;
  throw createError({
    statusCode: code,
    statusMessage: code === 404 ? "Not Found" : "Service Unavailable",
    fatal: true,
  });
}

const cat = computed(() => data.value!.category);
const hasMore = computed(() => data.value!.articles.length < data.value!.total);

useSeoMeta({
  title: () => cat.value.name,
  description: () => cat.value.description ?? undefined,
  ogType: "website",
});

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [{ name: "الرئيسية", item: "/" }, { name: cat.value.name }],
  }),
]);
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-10">
    <header class="rule-double pt-2">
      <h1 class="font-headline text-3xl font-extrabold md:text-4xl">{{ cat.name }}</h1>
      <p v-if="cat.description" class="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
        {{ cat.description }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground">{{ data!.total }} مقالاً في هذا القسم</p>
    </header>

    <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      <ArticleCard v-for="a in data!.articles" :key="a.id" :article="a" />
    </div>

    <div v-if="hasMore" class="mt-12 text-center">
      <button
        :disabled="status === 'pending'"
        class="rounded-md border-2 border-brand-red px-8 py-2.5 font-headline font-bold text-brand-red transition-colors hover:bg-brand-red hover:text-white disabled:opacity-60 dark:border-brand-red-dark dark:text-brand-red-dark dark:hover:bg-brand-red-dark dark:hover:text-brand-navy"
        @click="limit += PAGE_SIZE"
      >
        {{ status === "pending" ? "جارٍ التحميل…" : "تحميل المزيد" }}
      </button>
    </div>
  </main>
</template>
