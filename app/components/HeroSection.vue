<script setup lang="ts">
import type { HomeData } from "~/types/api";

const props = defineProps<{ articles: HomeData["hero"] }>();

const main = computed(() => props.articles[0]);
const rest = computed(() => props.articles.slice(1));
</script>

<template>
  <section v-if="main" aria-label="أبرز الأخبار" class="border-b border-border">
    <div class="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-5">
      <!-- القصة الرئيسية -->
      <article class="group lg:col-span-3">
        <NuxtLink :to="`/${main.category.slug}/${main.slug}`" class="block">
          <Cover
            :cover="main.cover"
            :category-name="main.category.name"
            class="aspect-[16/9] w-full"
          />
          <div class="pt-4">
            <div class="flex items-center gap-3">
              <span
                class="bg-brand-red px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy"
              >
                {{ main.category.name }}
              </span>
              <span
                v-if="main.isBreaking"
                class="flex items-center gap-1.5 text-xs font-bold text-brand-red dark:text-brand-red-dark"
              >
                <span class="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
                عاجل
              </span>
            </div>
            <h1
              class="mt-3 font-headline text-2xl font-extrabold leading-[1.35] transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark md:text-4xl md:leading-[1.3]"
            >
              {{ main.title }}
            </h1>
            <p class="mt-3 line-clamp-2 max-w-2xl leading-relaxed text-muted-foreground">
              {{ main.excerpt }}
            </p>
            <div class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span class="font-semibold text-foreground/80">{{ main.author.name }}</span>
              <span aria-hidden="true">·</span>
              <time>{{ timeAgo(main.publishedAt) }}</time>
            </div>
          </div>
        </NuxtLink>
      </article>

      <!-- القصص الثانوية — قائمة مرقّمة تحريرية -->
      <div class="lg:col-span-2">
        <h2
          class="rule-double pt-2 font-headline text-sm font-bold uppercase tracking-wide text-muted-foreground"
        >
          في الواجهة
        </h2>
        <ol class="mt-2 divide-y divide-border">
          <li v-for="(a, i) in rest" :key="a.id">
            <NuxtLink
              :to="`/${a.category.slug}/${a.slug}`"
              class="group flex items-start gap-4 py-4"
            >
              <span
                aria-hidden="true"
                class="font-headline text-3xl font-extrabold leading-none text-brand-red/25 transition-colors group-hover:text-brand-red dark:text-brand-red-dark/30 dark:group-hover:text-brand-red-dark"
              >
                {{ String(i + 1).padStart(2, "0") }}
              </span>
              <div class="min-w-0">
                <span class="text-xs font-bold text-brand-red dark:text-brand-red-dark">
                  {{ a.category.name }}
                </span>
                <h3
                  class="mt-1 line-clamp-2 font-headline text-[15px] font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark"
                >
                  {{ a.title }}
                </h3>
                <span class="mt-1 block text-xs text-muted-foreground">
                  {{ timeAgo(a.publishedAt) }}
                </span>
              </div>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
