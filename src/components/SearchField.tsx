import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Search, X } from "./icons";

const DELAY_MS = 300;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || target.closest("input, textarea, select") !== null);

export const SearchField = ({
  shortcut,
  className,
}: {
  shortcut?: boolean;
  className?: string;
}) => {
  const q = useSearch({ strict: false, select: (s) => s.q ?? "" });
  const onLibrary = useLocation({ select: (l) => l.pathname === "/" });
  const navigate = useNavigate();
  const [draft, setDraft] = useState(q);
  const [seenQuery, setSeenQuery] = useState(q);
  const [sentQuery, setSentQuery] = useState(q);
  const [outsideChanges, setOutsideChanges] = useState(0);
  const timer = useRef<number>(undefined);
  const input = useRef<HTMLInputElement>(null);

  if (q !== seenQuery) {
    setSeenQuery(q);
    if (q !== sentQuery) {
      setSentQuery(q);
      setDraft(q);
      setOutsideChanges((n) => n + 1);
    }
  }

  useEffect(() => window.clearTimeout(timer.current), [outsideChanges]);

  const push = (value: string) => {
    window.clearTimeout(timer.current);
    const next = value.trim();
    if (next === q) return;
    setSentQuery(next);
    void navigate({ to: "/", search: { page: 1, q: next }, replace: onLibrary });
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
      if (!input.current?.checkVisibility()) return;
      e.preventDefault();
      input.current.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  return (
    <search className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push(draft);
        }}
      >
        <label className="lb-search">
          <Search size={20} aria-hidden />
          <input
            ref={input}
            type="search"
            value={draft}
            placeholder="Search title or author"
            aria-label="Search title or author"
            aria-keyshortcuts={shortcut ? "/" : undefined}
            enterKeyHint="search"
            onChange={(e) => {
              const value = e.target.value;
              setDraft(value);
              window.clearTimeout(timer.current);
              timer.current = window.setTimeout(() => push(value), DELAY_MS);
            }}
          />
          {draft ? (
            <button
              type="button"
              aria-label="Clear search"
              className="-mr-1 grid size-(--tap) shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-inherit"
              onClick={() => {
                setDraft("");
                push("");
                input.current?.focus();
              }}
            >
              <span className="bg-surface-2 grid size-9 place-items-center rounded-full">
                <X size={16} strokeWidth={2.5} aria-hidden />
              </span>
            </button>
          ) : (
            shortcut && (
              <kbd
                aria-hidden="true"
                className="bg-surface-2 mr-2.5 rounded-xs px-1.75 py-0.75 font-mono text-xs max-lg:hidden"
              >
                /
              </kbd>
            )
          )}
        </label>
      </form>
    </search>
  );
};
