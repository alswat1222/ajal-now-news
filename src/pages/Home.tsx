import { useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { resetPageMeta } from "@/lib/seo";
import BreakingTicker from "@/components/BreakingTicker";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import CategoryBlock from "@/components/CategoryBlock";
import MostRead from "@/components/MostRead";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data, isLoading } = trpc.news.home.useQuery();

  useEffect(() => {
    resetPageMeta();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-8 w-full" />
        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          <Skeleton className="aspect-[16/9] lg:col-span-3" />
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <BreakingTicker items={data.breaking} />
      <HeroSection articles={data.hero} />

      <main className="mx-auto max-w-7xl px-4">
        {/* آخر الأخبار + الأكثر قراءة */}
        <div className="grid gap-10 py-8 lg:grid-cols-3">
          <section aria-label="آخر الأخبار" className="lg:col-span-2">
            <h2 className="rule-double pt-2 font-headline text-2xl font-extrabold">آخر الأخبار</h2>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              {data.latest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
          <MostRead items={data.mostRead} />
        </div>

        {/* الأقسام */}
        {data.categories.map((c) => (
          <CategoryBlock key={c.id} category={c} />
        ))}
      </main>
    </>
  );
}
