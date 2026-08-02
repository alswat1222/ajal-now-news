import { Link } from "react-router";
import type { MostReadItem } from "@contracts/types";
import { formatViews } from "@/lib/format";
import { Eye } from "lucide-react";

type Props = { items: MostReadItem[] };

export default function MostRead({ items }: Props) {
  if (!items.length) return null;

  return (
    <aside aria-label="الأكثر قراءة" className="rounded-md border border-border bg-card p-5">
      <h2 className="rule-double pt-1.5 font-headline text-lg font-extrabold">الأكثر قراءة</h2>
      <ol className="mt-4 divide-y divide-border">
        {items.map((a, i) => (
          <li key={a.id}>
            <Link
              to={`/${a.category.slug}/${a.slug}`}
              className="group flex items-start gap-3 py-3.5"
            >
              <span
                aria-hidden="true"
                className="font-headline text-2xl font-extrabold leading-none text-brand-red/30 transition-colors group-hover:text-brand-red dark:text-brand-red-dark/40 dark:group-hover:text-brand-red-dark"
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-muted-foreground">
                  {a.category.name}
                </span>
                <h3 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark">
                  {a.title}
                </h3>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {formatViews(a.viewsCount)} مشاهدة
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
