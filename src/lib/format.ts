const dateFmt = new Intl.DateTimeFormat("ar", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return dateFmt.format(new Date(d));
}

export function timeAgo(d: Date | string | null | undefined): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "قبل يوم";
  if (days < 7) return `قبل ${days} أيام`;
  return formatDate(d);
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} مليون`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} ألف`;
  return String(n);
}
