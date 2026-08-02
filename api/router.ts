import { createRouter, publicQuery } from "./middleware";
import { newsRouter } from "./newsRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
