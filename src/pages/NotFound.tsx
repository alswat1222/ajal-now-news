import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <span className="font-headline text-8xl font-extrabold text-brand-red/20 dark:text-brand-red-dark/25">
        404
      </span>
      <h1 className="mt-4 font-headline text-2xl font-extrabold">الصفحة غير موجودة</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        ربما حُذف المقال أو تغيّر رابطه. جرّب البحث أو عد إلى الصفحة الرئيسية لمتابعة آخر الأخبار.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="rounded-md bg-brand-red px-6 py-2.5 font-headline font-bold text-white transition-opacity hover:opacity-90 dark:bg-brand-red-dark dark:text-brand-navy"
        >
          الرئيسية
        </Link>
        <Link
          to="/search"
          className="rounded-md border border-border px-6 py-2.5 font-headline font-bold transition-colors hover:border-brand-red hover:text-brand-red dark:hover:border-brand-red-dark dark:hover:text-brand-red-dark"
        >
          البحث
        </Link>
      </div>
    </main>
  );
}
