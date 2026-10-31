import { afterEach, expect, test, vi } from "vitest";

const sync = vi.hoisted(
  () => ({}) as { subscribe?: (cb: () => void) => () => void; get?: () => string },
);

vi.mock("react", () => ({
  useSyncExternalStore: (subscribe: (cb: () => void) => () => void, get: () => string) => {
    sync.subscribe = subscribe;
    sync.get = get;
    return get();
  },
}));

type Options = { system?: "light" | "dark"; stored?: string; storageBroken?: boolean };

const setup = async ({ system = "light", stored, storageBroken }: Options = {}) => {
  vi.resetModules();
  const mediaListeners = new Set<() => void>();
  const mediaEvents: string[] = [];
  const media = {
    matches: system === "dark",
    addEventListener: (type: string, cb: () => void) => {
      mediaEvents.push(`add ${type}`);
      mediaListeners.add(cb);
    },
    removeEventListener: (type: string, cb: () => void) => {
      mediaEvents.push(`remove ${type}`);
      mediaListeners.delete(cb);
    },
  };
  const matchMedia = vi.fn(() => media);
  const windowEvents: Record<string, (e: { key: string }) => void> = {};
  vi.stubGlobal("window", {
    matchMedia,
    addEventListener: (type: string, cb: (e: { key: string }) => void) => (windowEvents[type] = cb),
  });
  const store = new Map<string, string>(stored ? [["libri-theme", stored]] : []);
  vi.stubGlobal(
    "localStorage",
    storageBroken
      ? {
          getItem: () => {
            throw new Error("blocked");
          },
          setItem: () => {
            throw new Error("blocked");
          },
          removeItem: () => {
            throw new Error("blocked");
          },
        }
      : {
          getItem: (k: string) => store.get(k) ?? null,
          setItem: (k: string, v: string) => store.set(k, v),
          removeItem: (k: string) => store.delete(k),
        },
  );
  const root = { dataset: {} as Record<string, string | undefined> };
  const metas = [
    { dataset: { scheme: "light" }, media: "" },
    { dataset: { scheme: "dark" }, media: "" },
  ];
  const querySelectorAll = vi.fn(() => metas);
  vi.stubGlobal("document", { documentElement: root, querySelectorAll });
  const { useTheme } = await import("./theme");
  const theme = useTheme();
  return {
    theme,
    store,
    root,
    metas,
    mediaListeners,
    mediaEvents,
    matchMedia,
    querySelectorAll,
    windowEvents,
    current: () => sync.get!(),
  };
};

afterEach(() => vi.unstubAllGlobals());

test.each([
  ["light", "light"],
  ["dark", "dark"],
] as const)("follows a %s device when nothing is stored", async (system, expected) => {
  const t = await setup({ system });
  expect(t.theme.theme).toBe(expected);
  expect(t.root.dataset.theme).toBeUndefined();
});

test("asks the browser for the dark colour scheme and for the theme-color tags", async () => {
  const t = await setup({ system: "light" });
  expect(t.matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
  t.theme.toggle();
  expect(t.querySelectorAll).toHaveBeenCalledWith('meta[name="theme-color"]');
});

test("ignores a stored value it does not know", async () => {
  const t = await setup({ system: "dark", stored: "blue" });
  expect(t.theme.theme).toBe("dark");
});

test.each(["light", "dark"])("uses a stored %s override over the device", async (stored) => {
  const t = await setup({ system: stored === "light" ? "dark" : "light", stored });
  expect(t.theme.theme).toBe(stored);
});

test("flipping away from the device stores an override and tells the page", async () => {
  const t = await setup({ system: "light" });
  const changed = vi.fn();
  sync.subscribe!(changed);
  t.theme.toggle();
  expect(t.store.get("libri-theme")).toBe("dark");
  expect(t.current()).toBe("dark");
  expect(t.root.dataset.theme).toBe("dark");
  expect(t.metas.map((m) => m.media)).toEqual(["not all", "all"]);
  expect(changed).toHaveBeenCalledOnce();
});

test("flipping back to match the device clears the override", async () => {
  const t = await setup({ system: "light", stored: "dark" });
  const changed = vi.fn();
  sync.subscribe!(changed);
  t.root.dataset.theme = "dark";
  t.theme.toggle();
  expect(t.store.has("libri-theme")).toBe(false);
  expect(t.current()).toBe("light");
  expect(t.root.dataset.theme).toBeUndefined();
  expect(t.metas.map((m) => m.media)).toEqual([
    "(prefers-color-scheme: light)",
    "(prefers-color-scheme: dark)",
  ]);
  expect(changed).toHaveBeenCalledOnce();
});

test("on a dark device the first flip goes to light", async () => {
  const t = await setup({ system: "dark" });
  t.theme.toggle();
  expect(t.store.get("libri-theme")).toBe("light");
  expect(t.metas.map((m) => m.media)).toEqual(["all", "not all"]);
});

test("keeps working in memory when storage is blocked", async () => {
  const t = await setup({ system: "light", storageBroken: true });
  expect(t.theme.theme).toBe("light");
  t.theme.toggle();
  expect(t.current()).toBe("dark");
  expect(t.root.dataset.theme).toBe("dark");
  t.theme.toggle();
  expect(t.current()).toBe("light");
  expect(t.root.dataset.theme).toBeUndefined();
});

test("another tab changing the theme updates this page", async () => {
  const t = await setup({ system: "light" });
  const changed = vi.fn();
  sync.subscribe!(changed);
  t.store.set("libri-theme", "dark");
  t.windowEvents.storage!({ key: "libri-theme" });
  expect(t.root.dataset.theme).toBe("dark");
  expect(changed).toHaveBeenCalledOnce();
  t.windowEvents.storage!({ key: "something-else" });
  expect(changed).toHaveBeenCalledOnce();
});

test("the device changing its theme tells the page, and stopping listening works", async () => {
  const t = await setup({ system: "light" });
  const changed = vi.fn();
  const stop = sync.subscribe!(changed);
  expect(t.mediaListeners.size).toBe(1);
  [...t.mediaListeners].forEach((cb) => cb());
  expect(changed).toHaveBeenCalledOnce();
  expect(t.mediaEvents).toEqual(["add change"]);
  stop();
  expect(t.mediaEvents).toEqual(["add change", "remove change"]);
  expect(t.mediaListeners.size).toBe(0);
  t.theme.toggle();
  expect(changed).toHaveBeenCalledOnce();
});
