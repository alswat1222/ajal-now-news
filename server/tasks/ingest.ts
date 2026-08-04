/**
 * مهمة مجدولة: ابتلاع كل المصادر النشطة.
 * تُشغَّل وفق `nitro.scheduledTasks` في nuxt.config.ts.
 */
export default defineTask({
  meta: {
    name: "ingest",
    description: "جلب تغذيات RSS وتوليد مسوّدات أخبار",
  },
  async run() {
    // شكل عائد موحّد — اتحاد الأشكال يكسر توقيع defineTask
    const result: { skipped: boolean; generated: number; sources: number; error: string | null } = {
      skipped: false, generated: 0, sources: 0, error: null,
    };

    if (!process.env.MISTRAL_API_KEY) {
      console.warn("[task:ingest] MISTRAL_API_KEY غير مضبوط — تخطّي");
      result.skipped = true;
      return { result };
    }

    try {
      const stats = await ingestAllActive(getDb());
      result.sources = stats.length;
      result.generated = stats.reduce((n, s) => n + s.generated, 0);
      console.log(`[task:ingest] وُلِّد ${result.generated} مقالاً من ${result.sources} مصدراً`);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error("[task:ingest] فشل:", result.error);
    }

    return { result };
  },
});
