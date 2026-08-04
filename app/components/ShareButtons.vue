<script setup lang="ts">
import { Link2, Check } from "lucide-vue-next";

const props = defineProps<{ url: string; title: string }>();

const copied = ref(false);

const links = computed(() => {
  const u = encodeURIComponent(props.url);
  const t = encodeURIComponent(props.title);
  return [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "فيسبوك", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "واتساب", href: `https://wa.me/?text=${t}%20${u}` },
    { name: "تيليجرام", href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];
});

async function copy() {
  try {
    if (navigator.share) {
      await navigator.share({ title: props.title, url: props.url });
      return;
    }
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    /* أُلغيت المشاركة */
  }
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 border-y border-border py-4">
    <span class="me-1 text-sm font-bold">شارك المقال:</span>
    <a
      v-for="l in links"
      :key="l.name"
      :href="l.href"
      target="_blank"
      rel="noopener noreferrer"
      class="rounded-md border border-border px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-brand-red hover:text-brand-red dark:hover:border-brand-red-dark dark:hover:text-brand-red-dark"
    >
      {{ l.name }}
    </a>
    <button
      class="flex items-center gap-1.5 rounded-md bg-brand-red px-3.5 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
      @click="copy"
    >
      <Check v-if="copied" class="h-4 w-4" />
      <Link2 v-else class="h-4 w-4" />
      {{ copied ? "تم النسخ" : "نسخ الرابط" }}
    </button>
  </div>
</template>
