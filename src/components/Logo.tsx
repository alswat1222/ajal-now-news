type Props = {
  /** light = نص فاتح للخلفيات الداكنة */
  variant?: "default" | "light";
  compact?: boolean;
};

export default function Logo({ variant = "default", compact = false }: Props) {
  const textColor = variant === "light" ? "text-white" : "text-foreground";
  const subColor = variant === "light" ? "text-white/60" : "text-muted-foreground";

  return (
    <span className="inline-flex items-center gap-2 select-none">
      {/* الشعار: حلقة «ع» مفتوحة يخترقها برق */}
      <svg
        viewBox="0 0 64 64"
        className={compact ? "h-8 w-8" : "h-10 w-10"}
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke="#E63946"
          strokeWidth="11"
          strokeDasharray="113 38"
          strokeLinecap="round"
          transform="rotate(55 32 32)"
        />
        <polygon
          points="36,10 19,36 29,36 25,56 45,27 34,27"
          className={variant === "light" ? "fill-white" : "fill-brand-navy dark:fill-white"}
        />
      </svg>
      <span className="flex flex-col leading-none">
        <span className={`font-headline font-bold ${compact ? "text-lg" : "text-2xl"} ${textColor}`}>
          عاجل <span className="text-brand-red dark:text-brand-red-dark">الآن</span>
        </span>
        {!compact && (
          <span className={`mt-1 text-[11px] font-medium tracking-wide ${subColor}`}>
            الخبر لحظة بلحظة
          </span>
        )}
      </span>
    </span>
  );
}
