// تحديث عنوان الصفحة ووصفها — SEO من جهة العميل
export function setPageMeta(title: string, description?: string) {
  document.title = title;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }
}

export function resetPageMeta() {
  setPageMeta(
    "عاجل الآن | الخبر لحظة بلحظة",
    "عاجل الآن — الخبر لحظة بلحظة: أخبار عاجلة وتحليلات معمقة في السياسة والاقتصاد والتقنية والرياضة والثقافة.",
  );
}
