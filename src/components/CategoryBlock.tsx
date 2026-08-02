import { Link } from "react-router";
import type { HomeData } from "@contracts/types";
import ArticleCard from "./ArticleCard";

type Props = {
  category: HomeData["categories"][number];
};

export default function CategoryBlock({ category }: Props) {
  if (!category.articles.length) return null;

  return (
    <section aria-label={`قسم ${category.name}`} className="py-8">
      <header className="rule-double mb-6 flex items-end justify-between pt-2">
        <h2 className="font-headline text-2xl font-extrabold">{category.name}</h2>
        <Link
          to={`/${category.slug}`}
          className="group flex items-center gap-1 text-sm font-bold text-brand-red dark:text-brand-red-dark"
        >
          المزيد
          <span aria-hidden="true" className="inline-block -scale-x-100 transition-transform group-hover:-translate-x-1">
            →
          </span>
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {category.articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
