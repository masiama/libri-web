import clsx from "clsx";

import { useTheme } from "#/lib/theme";

import { Moon, Sun } from "./icons";

export const ThemeToggle = ({ asMenuItem = false }: { asMenuItem?: boolean }) => {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="lb-switch"
      role={asMenuItem ? "menuitemcheckbox" : "switch"}
      tabIndex={asMenuItem ? -1 : undefined}
      aria-checked={theme === "dark"}
      onClick={toggle}
    >
      <Moon size={22} aria-hidden="true" />
      <span className="flex-1 font-semibold">Dark theme</span>
      <span className="lb-switch__track" aria-hidden="true">
        <span className="lb-switch__knob" />
      </span>
    </button>
  );
};

export const ThemeButton = ({ className }: { className?: string }) => {
  const { theme, toggle } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={clsx("lb-btn lb-btn--icon bg-surface shadow-md", className)}
      onClick={toggle}
    >
      <Icon size={22} aria-hidden="true" />
    </button>
  );
};
