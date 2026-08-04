<script setup lang="ts">
import type { ArticleListItem } from "~/types/api";

const props = withDefaults(
  defineProps<{
    article: ArticleListItem;
    variant?: "vertical" | "horizontal";
  }>(),
  { variant: "vertical" },
);

const href = computed(() => `/${props.article.category.slug}/${props.article.slug}`);
</script>

<template>
  <article v-if="variant === 'horizontal'" class="group">
    <NuxtLink :to="href" class="flex gap-4">
      <Cover
        :cover="article.cover"
        :category-name="article.category.name"
        class="aspect-[4/3] w-28 shrink-0 sm:w-36"
      />
      <div class="min-w-0 py-0.5">
        <span class="text-xs font-bold text-brand-red dark:text-brand-red-dark">
          {{ article.category.name }}
        </span>
        <h3
          class="mt-1 line-clamp-2 font-headline text-[15px] font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark"
        >
          {{ article.title }}
        </h3>
        <span class="mt-1.5 block text-xs text-muted-foreground">
          {{ timeAgo(article.publishedAt) }}
        </span>
      </div>
    </NuxtLink>
  </article>

  <article v-else class="group">
    <NuxtLink :to="href" class="block">
      <Cover
        :cover="article.cover"
        :category-name="article.category.name"
        class="aspect-[16/9] w-full transition-opacity group-hover:opacity-90"
      />
      <div class="pt-3">
        <span class="text-xs font-bold text-brand-red dark:text-brand-red-dark">
          {{ article.category.name }}
        </span>
        <h3
          class="mt-1 line-clamp-2 font-headline text-base font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark"
        >
          {{ article.title }}
        </h3>
        <p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {{ article.excerpt }}
        </p>
        <div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span class="font-semibold text-foreground/70">{{ article.author.name }}</span>
          <span aria-hidden="true">·</span>
          <time>{{ timeAgo(article.publishedAt) }}</time>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
