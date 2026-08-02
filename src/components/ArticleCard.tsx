import { Link } from "react-router";
import type { ArticleListItem } from "@contracts/types";
import { timeAgo } from "@/lib/format";
import Cover from "./Cover";

type Props = {
  article: ArticleListItem;
  variant?: "vertical" | "horizontal";
};

export default function ArticleCard({ article, variant = "vertical" }: Props) {
  const href = `/${article.category.slug}/${article.slug}`;

  if (variant === "horizontal") {
    return (
      <article className="group">
        <Link to={href} className="flex gap-4">
          <Cover
            cover={article.cover}
            categoryName={article.category.name}
            className="aspect-[4/3] w-28 shrink-0 sm:w-36"
          />
          <div className="min-w-0 py-0.5">
            <span className="text-xs font-bold text-brand-red dark:text-brand-red-dark">
              {article.category.name}
            </span>
            <h3 className="mt-1 line-clamp-2 font-headline text-[15px] font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark">
              {article.title}
            </h3>
            <span className="mt-1.5 block text-xs text-muted-foreground">
              {timeAgo(article.publishedAt)}
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link to={href} className="block">
        <Cover
          cover={article.cover}
          categoryName={article.category.name}
          className="aspect-[16/9] w-full transition-opacity group-hover:opacity-90"
        />
        <div className="pt-3">
          <span className="text-xs font-bold text-brand-red dark:text-brand-red-dark">
            {article.category.name}
          </span>
          <h3 className="mt-1 line-clamp-2 font-headline text-base font-bold leading-snug transition-colors group-hover:text-brand-red dark:group-hover:text-brand-red-dark">
            {article.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/70">{article.author.name}</span>
            <span aria-hidden="true">·</span>
            <time>{timeAgo(article.publishedAt)}</time>
          </div>
        </div>
      </Link>
    </article>
  );
}
