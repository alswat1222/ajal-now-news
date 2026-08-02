type Props = {
  cover: string;
  categoryName?: string;
  /** حرف زخرفي كبير */
  glyph?: string;
  className?: string;
  rounded?: boolean;
};

const GLYPHS: Record<string, string> = {
  red: "ع",
  navy: "ال",
  gold: "ر",
  teal: "ت",
  plum: "م",
};

/** غلاف مقال مرسوم بالكود — تدرج لوني + نقش + حرف زخرفي */
export default function Cover({ cover, categoryName, glyph, className = "", rounded = true }: Props) {
  return (
    <div
      className={`cover-${cover} relative overflow-hidden ${rounded ? "rounded-md" : ""} ${className}`}
      role="img"
      aria-label={categoryName ? `غلاف قسم ${categoryName}` : "غلاف المقال"}
    >
      <div className="cover-pattern absolute inset-0" />
      {/* خطوط قطرية زخرفية */}
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
        <line x1="0" y1="100%" x2="100%" y2="30%" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="115%" x2="100%" y2="45%" stroke="white" strokeWidth="0.75" />
      </svg>
      <span
        aria-hidden="true"
        className="absolute -bottom-10 -end-2 font-headline text-[11rem] font-bold leading-none text-white/15 select-none"
      >
        {glyph ?? GLYPHS[cover] ?? "ع"}
      </span>
    </div>
  );
}
