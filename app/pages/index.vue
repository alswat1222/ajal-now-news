<script setup lang="ts">
const { data, status, error } = await useFetch("/api/news/home");

// الصفحة الرئيسية تحتفظ بالعنوان الكامل بلا قالب — كما في نسخة React
useHead({ titleTemplate: null });
useSeoMeta({
  title: "عاجل الآن | الخبر لحظة بلحظة",
  description:
    "عاجل الآن — الخبر لحظة بلحظة: أخبار عاجلة وتحليلات معمقة في السياسة والاقتصاد والتقنية والرياضة والثقافة.",
  ogType: "website",
});
</script>

<template>
  <!-- تعذّر جلب البيانات (قاعدة البيانات معطّلة) — الهيكل يبقى قائماً ولا تنهار الصفحة -->
  <main v-if="error" class="mx-auto max-w-2xl px-4 py-24 text-center">
    <h1 class="font-headline text-2xl font-extrabold">المحتوى غير متاح مؤقتاً</h1>
    <p class="mt-3 leading-relaxed text-muted-foreground">
      نواجه عطلاً تقنياً في جلب الأخبار. حدّث الصفحة بعد قليل.
    </p>
  </main>

  <div v-else-if="status === 'pending' || !data" class="mx-auto max-w-7xl px-4 py-8">
    <Skeleton class="h-8 w-full" />
    <div class="mt-8 grid gap-8 lg:grid-cols-5">
      <Skeleton class="aspect-[16/9] lg:col-span-3" />
      <div class="space-y-4 lg:col-span-2">
        <Skeleton v-for="i in 4" :key="i" class="h-20 w-full" />
      </div>
    </div>
    <div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Skeleton v-for="i in 8" :key="i" class="h-56 w-full" />
    </div>
  </div>

  <template v-else>
    <BreakingTicker :items="data.breaking" />
    <HeroSection :articles="data.hero" />

    <main class="mx-auto max-w-7xl px-4">
      <!-- آخر الأخبار + الأكثر قراءة -->
      <div class="grid gap-10 py-8 lg:grid-cols-3">
        <section aria-label="آخر الأخبار" class="lg:col-span-2">
          <h2 class="rule-double pt-2 font-headline text-2xl font-extrabold">آخر الأخبار</h2>
          <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            <ArticleCard v-for="a in data.latest" :key="a.id" :article="a" />
          </div>
        </section>
        <MostRead :items="data.mostRead" />
      </div>

      <!-- الأقسام -->
      <CategoryBlock v-for="c in data.categories" :key="c.id" :category="c" />
    </main>
  </template>
</template>
