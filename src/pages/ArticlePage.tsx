import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { setPageMeta } from "@/lib/seo";
import { formatDate, timeAgo, formatViews } from "@/lib/format";
import Cover from "@/components/Cover";
import ShareButtons from "@/components/ShareButtons";
import ArticleCard from "@/components/ArticleCard";
import NotFound from "./NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";

export default function ArticlePage() {
  const { category = "", slug = "" } = useParams();

  const { data: article, isLoading } = trpc.news.article.useQuery(
    { category, slug },
    { retry: false },
  );

  const { data: related } = trpc.news.related.useQuery(
    { categoryId: article?.categoryId ?? 0, excludeId: article?.id ?? 0 },
    { enabled: !!article },
  );

  const viewMutation = trpc.news.view.useMutation();

  // عدّاد المشاهدات — مرة واحدة لكل مقال في الجلسة
  useEffect(() => {
    if (!article) return;
    const key = `viewed-${article.id}`;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        viewMutation.mutate({ id: article.id });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  useEffect(() => {
    if (article) setPageMeta(`${article.title} | عاجل الآن`, article.excerpt);
  }, [article]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-10 w-full" />
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-8 aspect-[16/9] w-full" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (!article) return <NotFound />;

  const paragraphs = article.content.split(/\n\n+/);
  const [lede, ...body] = paragraphs;
  const url = window.location.href;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <article>
        {/* مسار التنقل */}
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <Link to={`/${article.category.slug}`} className="font-semibold text-brand-red hover:underline dark:text-brand-red-dark">
            {article.category.name}
          </Link>
        </nav>

        <header className="mt-5">
          {article.isBreaking && (
            <span className="mb-3 inline-flex items-center gap-1.5 bg-brand-red px-2 py-0.5 text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-current" />
              عاجل
            </span>
          )}
          <h1 className="font-headline text-3xl font-extrabold leading-[1.35] md:text-4xl md:leading-[1.3]">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy font-headline text-xs font-bold text-white dark:bg-brand-red-dark dark:text-brand-navy">
                {article.author.initials}
              </span>
              <span className="font-bold text-foreground">{article.author.name}</span>
              {article.author.role && <span className="hidden sm:inline">— {article.author.role}</span>}
            </span>
            <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined}>
              {formatDate(article.publishedAt)}
            </time>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {formatViews(article.viewsCount)} مشاهدة
            </span>
            <span className="ms-auto text-xs">{timeAgo(article.publishedAt)}</span>
          </div>
        </header>

        <Cover
          cover={article.cover}
          categoryName={article.category.name}
          className="mt-6 aspect-[16/9] w-full"
        />

        {/* المتن */}
        <div className="mt-8">
          <p className="font-headline text-lg font-semibold leading-[1.9] text-foreground md:text-xl md:leading-[1.9]">
            {lede}
          </p>
          <div className="mt-6 space-y-6 text-[17px] leading-[2] text-foreground/85">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* الوسوم */}
        {article.articleTags.length > 0 && (
          <footer className="mt-10 flex flex-wrap gap-2">
            {article.articleTags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground"
              >
                #{tag.name}
              </span>
            ))}
          </footer>
        )}

        <div className="mt-8">
          <ShareButtons url={url} title={article.title} />
        </div>
      </article>

      {/* مقالات ذات صلة */}
      {related && related.length > 0 && (
        <aside className="mt-14" aria-label="مقالات ذات صلة">
          <h2 className="rule-double pt-2 font-headline text-2xl font-extrabold">مقالات ذات صلة</h2>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </aside>
      )}
    </main>
  );
}
