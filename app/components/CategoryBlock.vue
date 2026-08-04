<script setup lang="ts">
import type { HomeCategoryBlock } from "~/types/api";

defineProps<{ category: HomeCategoryBlock }>();
</script>

<template>
  <section v-if="category.articles.length" :aria-label="`قسم ${category.name}`" class="py-8">
    <header class="rule-double mb-6 flex items-end justify-between pt-2">
      <h2 class="font-headline text-2xl font-extrabold">{{ category.name }}</h2>
      <NuxtLink
        :to="`/${category.slug}`"
        class="group flex items-center gap-1 text-sm font-bold text-brand-red dark:text-brand-red-dark"
      >
        المزيد
        <span
          aria-hidden="true"
          class="inline-block -scale-x-100 transition-transform group-hover:-translate-x-1"
        >
          →
        </span>
      </NuxtLink>
    </header>
    <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      <ArticleCard v-for="a in category.articles" :key="a.id" :article="a" />
    </div>
  </section>
</template>
