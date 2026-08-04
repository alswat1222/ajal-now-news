<script setup lang="ts">
import { Eye } from "lucide-vue-next";
import type { MostReadItem } from "~/types/api";

defineProps<{ items: MostReadItem[] }>();
</script>

<template>
  <aside
    v-if="items.length"
    aria-label="الأكثر قراءة"
    class="rounded-md border border-border bg-card p-5"
  >
    <h2 class="rule-double pt-1.5 font-headline text-lg font-extrabold">الأكثر قراءة</h2>
    <ol class="mt-4 divide-y divide-border">
      <li v-for="(a, i) in items" :key="a.id">
        <NuxtLink
          :to="`/${a.category.slug}/${a.slug}`"
          class="group flex items-start gap-3 py-3.5"
        >
          <span
            aria-hidden="true"
            class="font-headline text-2xl font-extrabold leading-none text-brand-red/30 transition-colors group-hover:text-brand-red dark:text-brand-red-dark/40 dark:group-hover:text-brand-red-dark"
          >
            {{ i + 1 }}
          </span>
          <div class="min-w-0">
            <span class="text-[11px] font-bold text-muted-foreground">
              {{ a.category.name }}
            </span>
            <h3
              class="mt-0.5 line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark"
            >
              {{ a.title }}
            </h3>
            <span class="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Eye class="h-3 w-3" />
              {{ formatViews(a.viewsCount) }} مشاهدة
            </span>
          </div>
        </NuxtLink>
      </li>
    </ol>
  </aside>
</template>
