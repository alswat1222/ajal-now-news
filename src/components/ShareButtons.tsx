import { useState } from "react";
import { Link2, Check } from "lucide-react";

type Props = { url: string; title: string };

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "فيسبوك", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "واتساب", href: `https://wa.me/?text=${t}%20${u}` },
    { name: "تيليجرام", href: `https://t.me/share/url?url=${u}&text=${t}` },
  ];

  const copy = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* أُلغيت المشاركة */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-border py-4">
      <span className="me-1 text-sm font-bold">شارك المقال:</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-border px-3.5 py-1.5 text-sm font-semibold transition-colors hover:border-brand-red hover:text-brand-red dark:hover:border-brand-red-dark dark:hover:text-brand-red-dark"
        >
          {l.name}
        </a>
      ))}
      <button
        onClick={copy}
        className="flex items-center gap-1.5 rounded-md bg-brand-red px-3.5 py-1.5 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "تم النسخ" : "نسخ الرابط"}
      </button>
    </div>
  );
}
