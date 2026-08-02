import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Logo from "./Logo";

export default function Footer() {
  const { data: categories } = trpc.news.categories.useQuery();

  return (
    <footer className="mt-16 bg-brand-navy text-white dark:bg-[#0a141f]">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              منصة إخبارية عربية تجمع بين سرعة الخبر العاجل وعمق التحليل.
              نغطي السياسة والاقتصاد والتقنية والرياضة والثقافة على مدار الساعة.
            </p>
          </div>

          <nav aria-label="أقسام الموقع في التذييل">
            <h3 className="mb-4 font-headline text-sm font-bold text-white/40">الأقسام</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>
                <Link to="/" className="text-white/75 transition-colors hover:text-brand-red-dark">
                  الرئيسية
                </Link>
              </li>
              {categories?.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`/${c.slug}`}
                    className="text-white/75 transition-colors hover:text-brand-red-dark"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 font-headline text-sm font-bold text-white/40">وعدنا التحريري</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <span className="text-brand-red-dark">◆</span> السرعة لا تلغي الدقة
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-red-dark">◆</span> السياق قبل الضجيج
              </li>
              <li className="flex items-center gap-2">
                <span className="text-brand-red-dark">◆</span> القارئ يستحق التفسير لا النقل فقط
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          عاجل الآن © {new Date().getFullYear()} — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
