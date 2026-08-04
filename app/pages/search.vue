<script setup lang="ts">
import { Search } from "lucide-vue-next";

const input = ref("");
const q = ref("");

// تأخير بسيط لتفادي طلب لكل حرف
let timer: ReturnType<typeof setTimeout> | undefined;
watch(input, (value) => {
  clearTimeout(timer);
  timer = setTimeout(() => (q.value = value), 350);
});
onBeforeUnmount(() => clearTimeout(timer));

const enabled = computed(() => q.value.trim().length >= 2);

const { data: results, status } = await useFetch("/api/news/search", {
  query: { q },
  immediate: false,
  watch: [q],
  default: () => [],
});

watch(enabled, (on) => {
  if (!on) results.value = [];
});

// صفحات نتائج البحث محتوى رقيق ومتغيّر — تُستثنى من الفهرسة مع تتبّع الروابط
useSeoMeta({
  title: "البحث",
  robots: "noindex, follow",
});
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <h1 class="rule-double pt-2 font-headline text-3xl font-extrabold">البحث</h1>
      <label
        class="mt-6 flex items-center gap-3 rounded-md border-2 border-border bg-card px-4 py-3 focus-within:border-brand-red dark:focus-within:border-brand-red-dark"
      >
        <Search class="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          v-model="input"
          type="search"
          placeholder="ابحث في العناوين والملخصات…"
          class="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
        >
      </label>
      <p class="mt-2 text-xs text-muted-foreground">اكتب حرفين على الأقل لبدء البحث</p>
    </div>

    <section v-if="enabled" class="mt-12" aria-live="polite">
      <h2 class="text-sm font-bold text-muted-foreground">
        <template v-if="status === 'pending'">جارٍ البحث…</template>
        <template v-else-if="results.length">{{ results.length }} نتيجة عن «{{ q }}»</template>
        <template v-else>لا نتائج عن «{{ q }}»</template>
      </h2>
      <div class="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        <ArticleCard v-for="a in results" :key="a.id" :article="a" />
      </div>
    </section>
  </main>
</template>
