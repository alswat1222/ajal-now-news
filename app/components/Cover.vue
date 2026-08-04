<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    cover: string;
    categoryName?: string;
    /** حرف زخرفي كبير */
    glyph?: string;
    rounded?: boolean;
  }>(),
  { rounded: true },
);

const GLYPHS: Record<string, string> = {
  red: "ع",
  navy: "ال",
  gold: "ر",
  teal: "ت",
  plum: "م",
};

const glyphChar = computed(() => props.glyph ?? GLYPHS[props.cover] ?? "ع");
</script>

<!-- غلاف مقال مرسوم بالكود — تدرج لوني + نقش + حرف زخرفي -->
<template>
  <div
    :class="[`cover-${cover}`, 'relative overflow-hidden', rounded ? 'rounded-md' : '']"
    role="img"
    :aria-label="categoryName ? `غلاف قسم ${categoryName}` : 'غلاف المقال'"
  >
    <div class="cover-pattern absolute inset-0" />
    <!-- خطوط قطرية زخرفية -->
    <svg class="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
      <line x1="0" y1="100%" x2="100%" y2="30%" stroke="white" stroke-width="1.5" />
      <line x1="0" y1="115%" x2="100%" y2="45%" stroke="white" stroke-width="0.75" />
    </svg>
    <span
      aria-hidden="true"
      class="absolute -bottom-10 -end-2 select-none font-headline text-[11rem] font-bold leading-none text-white/15"
    >
      {{ glyphChar }}
    </span>
  </div>
</template>
