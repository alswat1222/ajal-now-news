import { Link } from "react-router";
import type { HomeData } from "@contracts/types";
import { timeAgo } from "@/lib/format";
import Cover from "./Cover";

type Props = { articles: HomeData["hero"] };

export default function HeroSection({ articles }: Props) {
  if (!articles.length) return null;
  const [main, ...rest] = articles;

  return (
    <section aria-label="أبرز الأخبار" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-5">
        {/* القصة الرئيسية */}
        <article className="group lg:col-span-3">
          <Link to={`/${main.category.slug}/${main.slug}`} className="block">
            <Cover
              cover={main.cover}
              categoryName={main.category.name}
              className="aspect-[16/9] w-full"
            />
            <div className="pt-4">
              <div className="flex items-center gap-3">
                <span className="bg-brand-red px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy">
                  {main.category.name}
                </span>
                {main.isBreaking && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-brand-red dark:text-brand-red-dark">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
                    عاجل
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-headline text-2xl font-extrabold leading-[1.35] transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark md:text-4xl md:leading-[1.3]">
                {main.title}
              </h1>
              <p className="mt-3 line-clamp-2 max-w-2xl leading-relaxed text-muted-foreground">
                {main.excerpt}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground/80">{main.author.name}</span>
                <span aria-hidden="true">·</span>
                <time>{timeAgo(main.publishedAt)}</time>
              </div>
            </div>
          </Link>
        </article>

        {/* القصص الثانوية — قائمة مرقّمة تحريرية */}
        <div className="lg:col-span-2">
          <h2 className="rule-double pt-2 font-headline text-sm font-bold uppercase tracking-wide text-muted-foreground">
            في الواجهة
          </h2>
          <ol className="mt-2 divide-y divide-border">
            {rest.map((a, i) => (
              <li key={a.id}>
                <Link
                  to={`/${a.category.slug}/${a.slug}`}
                  className="group flex items-start gap-4 py-4"
                >
                  <span
                    aria-hidden="true"
                    className="font-headline text-3xl font-extrabold leading-none text-brand-red/25 transition-colors group-hover:text-brand-red dark:text-brand-red-dark/30 dark:group-hover:text-brand-red-dark"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-brand-red dark:text-brand-red-dark">
                      {a.category.name}
                    </span>
                    <h3 className="mt-1 line-clamp-2 font-headline text-[15px] font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark">
                      {a.title}
                    </h3>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {timeAgo(a.publishedAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
