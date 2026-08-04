<script setup lang="ts">
const { data: categories } = await useFetch("/api/news/categories", {
  default: () => [],
});

// يُحسب على الخادم ويُسلسَل — يمنع اختلاف الترطيب عند حدود رأس السنة
const year = useState("footer-year", () => new Date().getFullYear());
</script>

<template>
  <footer class="mt-16 bg-brand-navy text-white dark:bg-[#0a141f]">
    <div class="mx-auto max-w-7xl px-4 py-12">
      <div class="grid gap-10 md:grid-cols-3">
        <div>
          <Logo variant="light" />
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            منصة إخبارية عربية تجمع بين سرعة الخبر العاجل وعمق التحليل. نغطي السياسة والاقتصاد
            والتقنية والرياضة والثقافة على مدار الساعة.
          </p>
        </div>

        <nav aria-label="أقسام الموقع في التذييل">
          <h3 class="mb-4 font-headline text-sm font-bold text-white/40">الأقسام</h3>
          <ul class="grid grid-cols-2 gap-2 text-sm">
            <li>
              <NuxtLink to="/" class="text-white/75 transition-colors hover:text-brand-red-dark">
                الرئيسية
              </NuxtLink>
            </li>
            <li v-for="c in categories" :key="c.id">
              <NuxtLink
                :to="`/${c.slug}`"
                class="text-white/75 transition-colors hover:text-brand-red-dark"
              >
                {{ c.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div>
          <h3 class="mb-4 font-headline text-sm font-bold text-white/40">وعدنا التحريري</h3>
          <ul class="space-y-2 text-sm text-white/60">
            <li class="flex items-center gap-2">
              <span class="text-brand-red-dark">◆</span> السرعة لا تلغي الدقة
            </li>
            <li class="flex items-center gap-2">
              <span class="text-brand-red-dark">◆</span> السياق قبل الضجيج
            </li>
            <li class="flex items-center gap-2">
              <span class="text-brand-red-dark">◆</span> القارئ يستحق التفسير لا النقل فقط
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
        عاجل الآن © {{ year }} — جميع الحقوق محفوظة
      </div>
    </div>
  </footer>
</template>
