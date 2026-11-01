import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_app/$")({
  beforeLoad: () => {
    throw notFound();
  },
});
