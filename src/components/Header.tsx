import { Link, NavLink, useNavigate } from "react-router";
import { Search, Moon, Sun } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/lib/theme";
import { formatDate } from "@/lib/format";
import Logo from "./Logo";

export default function Header() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { data: categories } = trpc.news.categories.useQuery();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      {/* الشريط العلوي */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-muted-foreground">
          <span>{formatDate(new Date())}</span>
          <span className="hidden sm:block">صحافة تشرح بعمق ما يمر بسرعة</span>
        </div>
      </div>

      {/* الصف الرئيسي */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" aria-label="عاجل الآن — الرئيسية" className="shrink-0">
          <Logo />
        </Link>

        <div className="ms-auto flex items-center gap-1">
          <button
            onClick={() => navigate("/search")}
            aria-label="بحث"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* شريط الأقسام */}
      <nav aria-label="أقسام الموقع" className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-brand-red text-brand-red dark:border-brand-red-dark dark:text-brand-red-dark"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`
            }
          >
            الرئيسية
          </NavLink>
          {categories?.map((c) => (
            <NavLink
              key={c.id}
              to={`/${c.slug}`}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-brand-red text-brand-red dark:border-brand-red-dark dark:text-brand-red-dark"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {c.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
