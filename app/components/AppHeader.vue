<script setup lang="ts">
import { Search, Moon, Sun } from "lucide-vue-next";

const route = useRoute();
const colorMode = useColorMode();

// عند تعطّل قاعدة البيانات يرد المسار 503 — الافتراض قائمة فارغة والرأس يبقى قائماً
const { data: categories } = await useFetch("/api/news/categories", {
  default: () => [],
});

// يُحسب على الخادم ويُسلسَل إلى العميل — يمنع اختلاف الترطيب عند حدود منتصف الليل
const today = useState("header-date", () => formatDate(new Date()));

const NAV_BASE =
  "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors";
const NAV_ACTIVE =
  "border-brand-red text-brand-red dark:border-brand-red-dark dark:text-brand-red-dark";
const NAV_IDLE = "border-transparent text-muted-foreground hover:text-foreground";

function toggleTheme() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
    <!-- الشريط العلوي -->
    <div class="border-b border-border">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground"
      >
        <span>{{ today }}</span>
        <span class="hidden sm:block">صحافة تشرح بعمق ما يمر بسرعة</span>
      </div>
    </div>

    <!-- الصف الرئيسي -->
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
      <NuxtLink to="/" aria-label="عاجل الآن — الرئيسية" class="shrink-0">
        <Logo />
      </NuxtLink>

      <div class="ms-auto flex items-center gap-1">
        <NuxtLink
          to="/search"
          aria-label="بحث"
          class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Search class="h-5 w-5" />
        </NuxtLink>

        <!-- الأيقونة تعتمد على تفضيل المستخدم المخزَّن محلياً — لا تُعرض على الخادم -->
        <ClientOnly>
          <button
            :aria-label="colorMode.value === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'"
            class="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            @click="toggleTheme"
          >
            <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
            <Moon v-else class="h-5 w-5" />
          </button>
          <template #fallback>
            <span class="block h-9 w-9" />
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- شريط الأقسام -->
    <nav aria-label="أقسام الموقع" class="border-t border-border">
      <div class="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
        <NuxtLink to="/" :class="[NAV_BASE, route.path === '/' ? NAV_ACTIVE : NAV_IDLE]">
          الرئيسية
        </NuxtLink>
        <NuxtLink
          v-for="c in categories"
          :key="c.id"
          :to="`/${c.slug}`"
          :class="[NAV_BASE, route.path === `/${c.slug}` ? NAV_ACTIVE : NAV_IDLE]"
        >
          {{ c.name }}
        </NuxtLink>
        <NuxtLink
          to="/jobs"
          :class="[NAV_BASE, route.path.startsWith('/jobs') ? NAV_ACTIVE : NAV_IDLE]"
        >
          وظائف
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
