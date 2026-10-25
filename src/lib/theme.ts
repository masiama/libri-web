import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const KEY = "libri-theme";
const media = window.matchMedia("(prefers-color-scheme: dark)");

const systemTheme = (): Theme => (media.matches ? "dark" : "light");

let unstoredOverride: Theme | null = null;

const getOverride = (): Theme | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return unstoredOverride;
  }
};

const effectiveTheme = () => getOverride() ?? systemTheme();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const applyTheme = () => {
  const override = getOverride();
  const root = document.documentElement;
  if (override) root.dataset.theme = override;
  else delete root.dataset.theme;
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    const scheme = meta.dataset.scheme;
    if (!override) meta.media = `(prefers-color-scheme: ${scheme})`;
    else meta.media = scheme === override ? "all" : "not all";
  }
};

const toggleTheme = () => {
  const target: Theme = effectiveTheme() === "dark" ? "light" : "dark";
  const override = target === systemTheme() ? null : target;
  try {
    if (override) localStorage.setItem(KEY, override);
    else localStorage.removeItem(KEY);
  } catch {
    unstoredOverride = override;
  }
  applyTheme();
  emit();
};

window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  applyTheme();
  emit();
});

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  media.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    media.removeEventListener("change", cb);
  };
};

export const useTheme = () => ({
  theme: useSyncExternalStore(subscribe, effectiveTheme),
  toggle: toggleTheme,
});
