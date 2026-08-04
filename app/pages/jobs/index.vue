<script setup lang="ts">
import { MapPin, Building2, Clock, Wallet } from "lucide-vue-next";

const { data: list, error } = await useFetch("/api/jobs", { default: () => [] });

useSeoMeta({
  title: "وظائف",
  description:
    "وظائف شاغرة محدّثة في السعودية والخليج: دوام كامل وجزئي وعن بُعد، عبر قطاعات التقنية والاقتصاد والإعلام وغيرها.",
  ogType: "website",
});

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: [{ name: "الرئيسية", item: "/" }, { name: "وظائف" }],
  }),
]);
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-10">
    <header class="rule-double pt-2">
      <h1 class="font-headline text-3xl font-extrabold md:text-4xl">وظائف</h1>
      <p class="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
        فرص عمل شاغرة يُراجَع كل إعلان قبل نشره، وتُزال الإعلانات تلقائياً عند انتهاء أجلها.
      </p>
      <p v-if="list.length" class="mt-2 text-sm text-muted-foreground">
        {{ list.length }} وظيفة سارية
      </p>
    </header>

    <p v-if="error" class="mt-10 text-muted-foreground">تعذّر جلب الوظائف مؤقتاً. حدّث الصفحة بعد قليل.</p>

    <div v-else-if="!list.length" class="mt-16 text-center">
      <p class="font-headline text-xl font-bold">لا توجد وظائف معلنة حالياً</p>
      <p class="mt-3 text-muted-foreground">
        نضيف الفرص فور توثيقها. عد لاحقاً أو تابع أقسام الموقع.
      </p>
      <NuxtLink
        to="/"
        class="mt-8 inline-block rounded-md bg-brand-red px-6 py-2.5 font-headline font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
      >
        الرئيسية
      </NuxtLink>
    </div>

    <ul v-else class="mt-10 divide-y divide-border">
      <li v-for="j in list" :key="j.id">
        <NuxtLink :to="`/jobs/${j.slug}`" class="group block py-6">
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-navy font-headline text-lg font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy"
            >
              {{ j.companyName.slice(0, 2) }}
            </div>

            <div class="min-w-0 flex-1">
              <h2
                class="font-headline text-lg font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark"
              >
                {{ j.title }}
              </h2>

              <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span class="flex items-center gap-1.5">
                  <Building2 class="h-4 w-4" />{{ j.companyName }}
                </span>
                <span class="flex items-center gap-1.5">
                  <MapPin class="h-4 w-4" />{{ jobLocation(j) }}
                </span>
                <span class="flex items-center gap-1.5">
                  <Clock class="h-4 w-4" />{{ employmentLabel(j.employmentType) }}
                </span>
                <span v-if="salaryRange(j)" class="flex items-center gap-1.5 font-semibold text-foreground/80">
                  <Wallet class="h-4 w-4" />{{ salaryRange(j) }}
                </span>
              </div>

              <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {{ j.excerpt }}
              </p>
            </div>

            <span class="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
              {{ timeAgo(j.postedAt) }}
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
