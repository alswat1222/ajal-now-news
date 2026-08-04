<script setup lang="ts">
/**
 * وحدة إعلانية من Google AdSense.
 *
 * التصميم:
 * · `<ins>` يُصيَّر على الخادم كما في مقتطف Google الرسمي، والدفع
 *   (`adsbygoogle.push`) يجري بعد التركيب على العميل وحده.
 * · كل تنقّل داخلي يركّب نسخة جديدة من المكوّن، أي عنصر `<ins>` جديداً،
 *   فلا يقع خطأ «العنصر يحمل إعلاناً بالفعل» الشائع في تطبيقات SPA.
 * · `minHeight` يحجز المساحة قبل وصول الإعلان — بدونه تقفز الصفحة (CLS).
 *
 * ⚠️ لا تضع هذه الوحدة في صفحة البحث ولا في صفحات الخطأ: الأولى صفحة نتائج
 * (سياسة AdSense تمنع إعلانات المحتوى عليها) والثانية صفحة بلا محتوى.
 */
withDefaults(
  defineProps<{
    /** قيمة data-ad-slot من لوحة AdSense — استعمل ثوابت AD_SLOTS */
    slotId: string;
    /** auto = متجاوب كامل · horizontal = شريط عريض منخفض */
    format?: "auto" | "horizontal" | "rectangle" | "vertical" | "fluid";
    /** ارتفاع محجوز يمنع قفزة التخطيط */
    minHeight?: string;
  }>(),
  { format: "auto", minHeight: "280px" },
);

const client = useRuntimeConfig().public.adsenseClient;
const isDev = import.meta.dev;

// لا إعلانات في التطوير: الظهور والنقر من localhost يُصنَّفان «حركة غير صالحة»
// وقد يوقفان حساب الناشر.
const live = Boolean(client) && !isDev;

const el = ref<HTMLElement | null>(null);

onMounted(() => {
  // عرض صفري وقت الدفع يجعل AdSense يرفض الوحدة (availableWidth=0)
  if (!el.value?.offsetWidth) return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    /* حاجب إعلانات أو سكربت لم يصل — لا أثر على القارئ */
  }
});
</script>

<template>
  <div v-if="live" class="my-8">
    <span
      class="mb-1.5 block text-center text-[10px] font-bold tracking-[0.2em] text-muted-foreground"
    >
      إعلان
    </span>
    <ins
      ref="el"
      class="adsbygoogle"
      :style="{ display: 'block', minHeight }"
      :data-ad-client="client"
      :data-ad-slot="slotId"
      :data-ad-format="format"
      data-full-width-responsive="true"
    />
  </div>

  <!-- التطوير: صندوق يوضّح موضع الوحدة وحجمها دون تحميل سكربت Google -->
  <div
    v-else-if="isDev"
    :style="{ minHeight }"
    class="my-8 flex items-center justify-center rounded-md border-2 border-dashed border-border text-xs font-bold text-muted-foreground"
  >
    وحدة إعلانية · {{ slotId }} · {{ format }}
  </div>
</template>
