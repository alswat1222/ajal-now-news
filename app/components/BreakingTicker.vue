<script setup lang="ts">
import type { BreakingItem } from "~/types/api";

const props = defineProps<{ items: BreakingItem[] }>();

// تكرار لحلقة سلسة
const track = computed(() => [...props.items, ...props.items]);
</script>

<template>
  <div v-if="items.length" class="bg-brand-red text-white dark:bg-[#c22a36]">
    <div class="mx-auto flex max-w-7xl items-stretch">
      <div
        class="flex shrink-0 items-center gap-2 bg-black/20 px-4 py-2.5 font-headline text-sm font-bold"
      >
        <span class="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-white" />
        عاجل
      </div>
      <div class="relative flex-1 overflow-hidden" dir="ltr">
        <div class="flex w-max animate-ticker hover:[animation-play-state:paused]">
          <NuxtLink
            v-for="(a, i) in track"
            :key="`${a.id}-${i}`"
            :to="`/${a.category.slug}/${a.slug}`"
            class="flex items-center gap-3 whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
          >
            <span class="text-white/50">◆</span>
            {{ a.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
