import type { MouseEvent } from "react";
import { beforeEach, expect, test, vi } from "vitest";

const router = vi.hoisted(() => ({ canGoBack: true, back: vi.fn() }));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ history: { back: router.back } }),
  useCanGoBack: () => router.canGoBack,
}));

import { useBackClick } from "./back";

const click = () => {
  const preventDefault = vi.fn();
  useBackClick()({ preventDefault } as unknown as MouseEvent);
  return preventDefault;
};

beforeEach(() => router.back.mockClear());

test("goes back in the history instead of following the link", () => {
  router.canGoBack = true;
  const preventDefault = click();
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(router.back).toHaveBeenCalledOnce();
});

test("leaves the link alone when there is nothing to go back to", () => {
  router.canGoBack = false;
  const preventDefault = click();
  expect(preventDefault).not.toHaveBeenCalled();
  expect(router.back).not.toHaveBeenCalled();
});
