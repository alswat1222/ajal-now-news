import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { setPageMeta, resetPageMeta } from "@/lib/seo";
import ArticleCard from "@/components/ArticleCard";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [input, setInput] = useState("");

  // تأخير بسيط لتفادي طلب لكل حرف
  const q = useDebounced(input, 350);

  const { data: results, isFetching } = trpc.news.search.useQuery(
    { q },
    { enabled: q.trim().length >= 2 },
  );

  useEffect(() => {
    setPageMeta("البحث | عاجل الآن");
    return () => resetPageMeta();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="rule-double pt-2 font-headline text-3xl font-extrabold">البحث</h1>
        <label className="mt-6 flex items-center gap-3 rounded-md border-2 border-border bg-card px-4 py-3 focus-within:border-brand-red dark:focus-within:border-brand-red-dark">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ابحث في العناوين والملخصات…"
            autoFocus
            className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">اكتب حرفين على الأقل لبدء البحث</p>
      </div>

      {q.trim().length >= 2 && (
        <section className="mt-12" aria-live="polite">
          <h2 className="text-sm font-bold text-muted-foreground">
            {isFetching
              ? "جارٍ البحث…"
              : results && results.length > 0
                ? `${results.length} نتيجة عن «${q}»`
                : `لا نتائج عن «${q}»`}
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {results?.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </main>
  );
}

function useDebounced(value: string, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return useMemo(() => v, [v]);
}
