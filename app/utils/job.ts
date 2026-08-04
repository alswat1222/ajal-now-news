/** تسميات عربية لأنواع التوظيف — قيم schema.org تبقى إنجليزية في المخطّط */
export const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  CONTRACTOR: "عقد",
  TEMPORARY: "مؤقت",
  INTERN: "تدريب",
  VOLUNTEER: "تطوّع",
  PER_DIEM: "باليومية",
  OTHER: "أخرى",
};

const UNIT_LABELS: Record<string, string> = {
  HOUR: "بالساعة",
  DAY: "يومياً",
  WEEK: "أسبوعياً",
  MONTH: "شهرياً",
  YEAR: "سنوياً",
};

export function employmentLabel(t: string): string {
  return EMPLOYMENT_LABELS[t] ?? t;
}

/** موقع العمل بصيغة مقروءة */
export function jobLocation(j: {
  isRemote: boolean; city?: string | null; region?: string | null;
}): string {
  if (j.isRemote) return "عن بُعد";
  return [j.city, j.region].filter(Boolean).join("، ") || "غير محدّد";
}

/** نطاق الراتب بصيغة عربية — يُخفى كلياً إن لم يُصرَّح به */
export function salaryRange(j: {
  salaryMin?: number | null; salaryMax?: number | null;
  salaryCurrency: string; salaryUnit: string;
}): string | null {
  const { salaryMin: min, salaryMax: max } = j;
  if (!min && !max) return null;
  const unit = UNIT_LABELS[j.salaryUnit] ?? "";
  const fmt = (n: number) => new Intl.NumberFormat("ar", { maximumFractionDigits: 0 }).format(n);
  const amount = min && max ? (min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`) : fmt((min ?? max)!);
  return `${amount} ${j.salaryCurrency} ${unit}`.trim();
}

/** الأيام المتبقية قبل انتهاء الإعلان */
export function daysLeft(validThrough: string | Date): number {
  const end = new Date(validThrough).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}
