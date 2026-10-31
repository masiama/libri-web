import { beforeEach, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
  replace: vi.fn(),
  history: {} as { replace: unknown },
  deps: undefined as unknown[] | undefined,
}));

vi.mock("@clerk/react", () => ({
  useUser: () => ({ isLoaded: state.isLoaded, isSignedIn: state.isSignedIn }),
}));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ history: state.history }),
}));
vi.mock("react", () => ({
  useEffect: (effect: () => void, deps: unknown[]) => {
    state.deps = deps;
    effect();
  },
}));
vi.mock("@clerk/react/errors", () => ({ isClerkAPIResponseError: () => false }));

import { useLeaveWhenSignedIn } from "./useLeaveWhenSignedIn";

beforeEach(() => {
  state.history = { replace: state.replace };
  state.isLoaded = true;
  state.isSignedIn = true;
  state.replace.mockClear();
});

test("sends a signed-in person to where they were going", () => {
  expect(useLeaveWhenSignedIn("/books/9780156012195")).toBe(true);
  expect(state.replace).toHaveBeenCalledWith("/books/9780156012195");
});

test("sends them home when there is no safe place to go", () => {
  useLeaveWhenSignedIn("https://evil.example");
  expect(state.replace).toHaveBeenCalledWith("/");
  useLeaveWhenSignedIn(undefined);
  expect(state.replace).toHaveBeenLastCalledWith("/");
});

test.each([
  ["nobody is signed in", true, false],
  ["Clerk has not finished loading", false, false],
  ["Clerk has not finished loading, even if it reports a session", false, true],
])("stays put when %s", (_, loaded, signedIn) => {
  state.isLoaded = loaded;
  state.isSignedIn = signedIn;
  expect(useLeaveWhenSignedIn("/scan")).toBe(false);
  expect(state.replace).not.toHaveBeenCalled();
});

test("runs again when the sign-in state, the history or the destination changes", () => {
  useLeaveWhenSignedIn("/scan");
  expect(state.deps).toEqual([true, state.history, "/scan"]);
  state.isSignedIn = false;
  useLeaveWhenSignedIn(undefined);
  expect(state.deps).toEqual([false, state.history, undefined]);
});
