<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();

const isNotFound = computed(() => props.error?.statusCode === 404);

useHead({ titleTemplate: null });
useSeoMeta({
  title: isNotFound.value ? "الصفحة غير موجودة | عاجل الآن" : "خطأ | عاجل الآن",
  // صفحات الخطأ لا تُفهرَس
  robots: "noindex, follow",
});
</script>

<template>
  <NuxtLayout>
    <main class="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span
        class="font-headline text-8xl font-extrabold text-brand-red/20 dark:text-brand-red-dark/25"
      >
        {{ error?.statusCode ?? 500 }}
      </span>

      <template v-if="isNotFound">
        <h1 class="mt-4 font-headline text-2xl font-extrabold">الصفحة غير موجودة</h1>
        <p class="mt-3 leading-relaxed text-muted-foreground">
          ربما حُذف المقال أو تغيّر رابطه. جرّب البحث أو عد إلى الصفحة الرئيسية لمتابعة آخر الأخبار.
        </p>
      </template>
      <template v-else>
        <h1 class="mt-4 font-headline text-2xl font-extrabold">تعذّر عرض الصفحة</h1>
        <p class="mt-3 leading-relaxed text-muted-foreground">
          نواجه عطلاً تقنياً مؤقتاً. حدّث الصفحة بعد قليل أو عد إلى الرئيسية.
        </p>
      </template>

      <div class="mt-8 flex gap-3">
        <NuxtLink
          to="/"
          class="rounded-md bg-brand-red px-6 py-2.5 font-headline font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
        >
          الرئيسية
        </NuxtLink>
        <NuxtLink
          to="/search"
          class="rounded-md border border-border px-6 py-2.5 font-headline font-bold transition-colors hover:border-brand-red hover:text-brand-red dark:hover:border-brand-red-dark dark:hover:text-brand-red-dark"
        >
          البحث
        </NuxtLink>
      </div>
    </main>
  </NuxtLayout>
</template>
