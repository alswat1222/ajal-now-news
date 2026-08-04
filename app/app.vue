<script setup lang="ts">
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
