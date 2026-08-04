<script setup lang="ts">
const { public: pub } = useRuntimeConfig();
const nuxtError = useError();
const route = useRoute();

/**
 * سكربت AdSense في رأس المستند من الخادم — بهذا يتحقّق Google من الموقع
 * ويبدأ تحميل الوحدات قبل الترطيب.
 *
 * يُحجب في ثلاث حالات:
 * · التطوير — الظهور والنقر من localhost يُصنَّفان «حركة غير صالحة».
 * · صفحات الخطأ — الإعلانات على صفحة بلا محتوى تخالف السياسة.
 * · صفحة البحث — سياسة AdSense تمنع إعلانات المحتوى على صفحات النتائج،
 *   وحجب السكربت يمنع الإعلانات التلقائية من الحلول محلّ الوحدات اليدوية.
 *
 * الشرط تفاعلي عمداً: حالة الخطأ والمسار يتغيّران بعد تهيئة المكوّن الجذر.
 */
const adsAllowed = computed(
  () =>
    Boolean(pub.adsenseClient) && !import.meta.dev && !nuxtError.value && route.path !== "/search",
);

useHead(
  computed(() => ({
    script: adsAllowed.value
      ? [
          {
            key: "adsense",
            src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pub.adsenseClient}`,
            async: true,
            crossorigin: "anonymous" as const,
          },
        ]
      : [],
  })),
);

// هوية الناشر — تُدمج في كل مخططات NewsArticle عبر الموقع
useSchemaOrg([
  defineOrganization({
    name: "عاجل الآن",
    description:
      "منصة إخبارية عربية تجمع بين سرعة الخبر العاجل وعمق التحليل. نغطي السياسة والاقتصاد والتقنية والرياضة والثقافة على مدار الساعة.",
  }),
  defineWebSite({
    name: "عاجل الآن",
    inLanguage: "ar",
  }),
  defineWebPage(),
]);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
