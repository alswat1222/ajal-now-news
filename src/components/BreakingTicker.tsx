import { Link } from "react-router";
import type { BreakingItem } from "@contracts/types";

type Props = { items: BreakingItem[] };

export default function BreakingTicker({ items }: Props) {
  if (!items.length) return null;

  const track = [...items, ...items]; // تكرار لحلقة سلسة

  return (
    <div className="bg-brand-red text-white dark:bg-[#c22a36]">
      <div className="mx-auto flex max-w-7xl items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-black/20 px-4 py-2.5 font-headline text-sm font-bold">
          <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-white" />
          عاجل
        </div>
        <div className="relative flex-1 overflow-hidden" dir="ltr">
          <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
            {track.map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                to={`/${a.category.slug}/${a.slug}`}
                className="flex items-center gap-3 whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
              >
                <span className="text-white/50">◆</span>
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
