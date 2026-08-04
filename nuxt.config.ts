// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-08-04",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxt/fonts",
    "@nuxtjs/seo",
  ],

  // ملف Tailwind الرئيسي — يُمرَّر للوحدة بدل css[] حتى لا يُحقن ملف افتراضي ثانٍ
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },

  // هوية الموقع — يقرأها @nuxtjs/seo لبناء canonical وOG وخرائط الموقع
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://ajel-now.net",
    name: "عاجل الآن",
    description:
      "عاجل الآن — الخبر لحظة بلحظة: أخبار عاجلة وتحليلات معمقة في السياسة والاقتصاد والتقنية والرياضة والثقافة.",
    defaultLocale: "ar",
  },

  // يطابق سلوك الثيم في نسخة React: صنف .dark على <html> ومفتاح ajal-theme
  colorMode: {
    classSuffix: "",
    storageKey: "ajal-theme",
    preference: "system",
    fallback: "light",
  },

  app: {
    head: {
      htmlAttrs: { lang: "ar", dir: "rtl" },
      titleTemplate: "%s | عاجل الآن",
      meta: [
        { charset: "UTF-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "theme-color", content: "#0D1B2A" },
      ],
    },
  },

  // استضافة ذاتية للخطوط بدل رابط Google Fonts الحاجب للعرض
  fonts: {
    families: [
      { name: "IBM Plex Sans Arabic", provider: "google", weights: [300, 400, 500, 600, 700] },
      { name: "Tajawal", provider: "google", weights: [400, 500, 700] },
    ],
  },

  robots: {
    disallow: ["/api/"],
  },

  nitro: {
    preset: "node-server",
  },

  runtimeConfig: {
    databaseUrl: "",
    appId: "",
    appSecret: "",
  },

  typescript: {
    strict: true,
  },
});
