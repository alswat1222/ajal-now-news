<script setup lang="ts">
withDefaults(
  defineProps<{
    /** light = نص فاتح للخلفيات الداكنة */
    variant?: "default" | "light";
    compact?: boolean;
  }>(),
  { variant: "default", compact: false },
);
</script>

<template>
  <span class="inline-flex select-none items-center gap-2">
    <!-- الشعار: حلقة «ع» مفتوحة يخترقها برق -->
    <svg viewBox="0 0 64 64" :class="compact ? 'h-8 w-8' : 'h-10 w-10'" aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="24"
        fill="none"
        stroke="#E63946"
        stroke-width="11"
        stroke-dasharray="113 38"
        stroke-linecap="round"
        transform="rotate(55 32 32)"
      />
      <polygon
        points="36,10 19,36 29,36 25,56 45,27 34,27"
        :class="variant === 'light' ? 'fill-white' : 'fill-brand-navy dark:fill-white'"
      />
    </svg>

    <span class="flex flex-col leading-none">
      <span
        class="font-headline font-bold"
        :class="[
          compact ? 'text-lg' : 'text-2xl',
          variant === 'light' ? 'text-white' : 'text-foreground',
        ]"
      >
        عاجل <span class="text-brand-red dark:text-brand-red-dark">الآن</span>
      </span>
      <span
        v-if="!compact"
        class="mt-1 text-[11px] font-medium"
        :class="variant === 'light' ? 'text-white/60' : 'text-muted-foreground'"
      >
        الخبر لحظة بلحظة
      </span>
    </span>
  </span>
</template>
