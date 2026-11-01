import { createRouter } from "@tanstack/react-router";

import { NotFound } from "#/components/NotFound";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
  interface HistoryState {
    libraryPage?: number;
    libraryQuery?: string;
  }
}
