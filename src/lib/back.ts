import { useCanGoBack, useRouter } from "@tanstack/react-router";
import type { MouseEvent } from "react";

export const useBackClick = () => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (e: MouseEvent) => {
    if (!canGoBack) return;
    e.preventDefault();
    router.history.back();
  };
};
