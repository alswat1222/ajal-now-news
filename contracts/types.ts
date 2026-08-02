export * from "./errors";

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../api/router";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type HomeData = RouterOutputs["news"]["home"];
export type ArticleListItem = HomeData["latest"][number];
export type BreakingItem = HomeData["breaking"][number];
export type MostReadItem = HomeData["mostRead"][number];
export type ArticleFull = NonNullable<RouterOutputs["news"]["article"]>;
export type CategoryPageData = NonNullable<RouterOutputs["news"]["byCategory"]>;
export type CategoryItem = RouterOutputs["news"]["categories"][number];
