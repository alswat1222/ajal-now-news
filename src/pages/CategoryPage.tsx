import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { setPageMeta, resetPageMeta } from "@/lib/seo";
import ArticleCard from "@/components/ArticleCard";
import NotFound from "./NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { category = "" } = useParams();
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = trpc.news.byCategory.useQuery(
    { slug: category, limit, offset: 0 },
    { retry: false },
  );

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [category]);

  useEffect(() => {
    if (data?.category) {
      setPageMeta(`${data.category.name} | عاجل الآن`, data.category.description ?? undefined);
    }
    return () => resetPageMeta();
  }, [data?.category]);

  if (!isLoading && !data) return <NotFound />;

  const hasMore = data ? data.articles.length < data.total : false;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="rule-double pt-2">
        <h1 className="font-headline text-3xl font-extrabold md:text-4xl">
          {data?.category.name ?? "…"}
        </h1>
        {data?.category.description && (
          <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
            {data.category.description}
          </p>
        )}
        {data && (
          <p className="mt-2 text-sm text-muted-foreground">{data.total} مقالاً في هذا القسم</p>
        )}
      </header>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {data!.articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                className="rounded-md border-2 border-brand-red px-8 py-2.5 font-headline font-bold text-brand-red transition-colors hover:bg-brand-red hover:text-white dark:border-brand-red-dark dark:text-brand-red-dark dark:hover:bg-brand-red-dark dark:hover:text-brand-navy"
              >
                تحميل المزيد
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
