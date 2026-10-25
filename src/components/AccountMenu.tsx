import { useClerk, useUser } from "@clerk/react";
import clsx from "clsx";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ThemeToggle } from "./ThemeToggle";

const wideQuery = "(min-width: 48rem)";

const subscribeWide = (onChange: () => void) => {
  const media = window.matchMedia(wideQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

const useWide = () =>
  useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches);

const Avatar = ({ className }: { className?: string }) => {
  const { user } = useUser();
  if (user?.hasImage) {
    return (
      <img src={user.imageUrl} alt="" className={clsx("rounded-full object-cover", className)} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "flex items-center justify-center rounded-full bg-(--cover-4-bg) font-bold text-(--cover-4-fg)",
        className,
      )}
    >
      {user?.primaryEmailAddress?.emailAddress.charAt(0).toUpperCase()}
    </span>
  );
};

const summarySizes = {
  sheet: { avatar: "size-12 text-[1.0625rem]", name: "text-base", email: "text-sm" },
  menu: { avatar: "size-10", name: "text-[0.9375rem]", email: "text-[0.8125rem]" },
};

const UserSummary = ({ size }: { size: keyof typeof summarySizes }) => {
  const { user } = useUser();
  const sizes = summarySizes[size];
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={clsx("shrink-0", sizes.avatar)} />
      <div className="min-w-0">
        {user?.fullName && <div className={clsx("font-bold", sizes.name)}>{user.fullName}</div>}
        <div
          className={clsx(
            "truncate",
            user?.fullName ? ["text-muted", sizes.email] : ["font-semibold", sizes.name],
          )}
        >
          {user?.primaryEmailAddress?.emailAddress}
        </div>
      </div>
    </div>
  );
};

export const AccountMenu = () => {
  const { signOut } = useClerk();
  const wide = useWide();
  const [open, setOpen] = useState(false);
  const [openedWide, setOpenedWide] = useState(wide);
  const root = useRef<HTMLDivElement>(null);
  const avatar = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ from: number; by: number }>(null);

  if (wide !== openedWide) {
    setOpenedWide(wide);
    setOpen(false);
  }

  useEffect(() => {
    if (!open || !wide) return;
    menu.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
    const onClick = (e: MouseEvent) => {
      if (root.current?.contains(e.target as Node)) return;
      setOpen(false);
      if (document.activeElement === document.body) avatar.current?.focus();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open, wide]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Tab") setOpen(false);
    if (e.key === "Escape") return avatar.current?.focus();
    if (e.key === "Tab") return;
    const items = [...menu.current!.querySelectorAll<HTMLElement>('[role^="menuitem"]')];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: -1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    items.at(next % items.length)?.focus();
  };

  const closeSheet = () => sheet.current?.classList.add("lb-sheet--closing");

  const onSheetAnimationEnd = (e: React.AnimationEvent<HTMLDialogElement>) => {
    if (e.animationName === "lb-sheet-out") e.currentTarget.close();
  };

  const onSheetClose = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.currentTarget.classList.remove("lb-sheet--closing");
    e.currentTarget.style.transform = "";
    setOpen(false);
  };

  const onSheetClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return;
    const r = e.currentTarget.getBoundingClientRect();
    const inside =
      r.top <= e.clientY && e.clientY <= r.bottom && r.left <= e.clientX && e.clientX <= r.right;
    if (!inside) closeSheet();
  };

  const onSheetPointerDown = (e: React.PointerEvent<HTMLDialogElement>) => {
    if ((e.target as Element).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.transition = "none";
    drag.current = { from: e.clientY, by: 0 };
  };

  const onSheetPointerMove = (e: React.PointerEvent<HTMLDialogElement>) => {
    if (!drag.current) return;
    drag.current.by = Math.max(0, e.clientY - drag.current.from);
    e.currentTarget.style.transform = `translateY(${drag.current.by}px)`;
  };

  const onSheetPointerUp = (e: React.PointerEvent<HTMLDialogElement>) => {
    if (!drag.current) return;
    const { by } = drag.current;
    drag.current = null;
    e.currentTarget.style.transition = "";
    if (by > e.currentTarget.offsetHeight / 4) closeSheet();
    else e.currentTarget.style.transform = "";
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={avatar}
        type="button"
        className="lb-avatar block p-0"
        aria-label="Account and settings"
        aria-haspopup={wide ? "menu" : "dialog"}
        aria-expanded={open}
        onClick={() => {
          if (!wide) sheet.current?.showModal();
          setOpen(!open);
        }}
      >
        <Avatar className="size-full" />
      </button>
      {wide && open && (
        <div
          ref={menu}
          role="menu"
          aria-label="Account"
          tabIndex={-1}
          className="lb-menu"
          onKeyDown={onMenuKeyDown}
        >
          <div className="px-1 pt-1.5 pb-3">
            <UserSummary size="menu" />
          </div>
          <hr className="border-line" />
          <ThemeToggle asMenuItem />
          <hr className="border-line" />
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="lb-menu__item lb-menu__item--danger"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </div>
      )}
      {!wide && (
        // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Backdrop click and drag to dismiss; Esc goes through onCancel
        <dialog
          ref={sheet}
          aria-label="Account"
          className="lb-sheet"
          onClick={onSheetClick}
          onCancel={(e) => {
            e.preventDefault();
            closeSheet();
          }}
          onAnimationEnd={onSheetAnimationEnd}
          onClose={onSheetClose}
          onPointerDown={onSheetPointerDown}
          onPointerMove={onSheetPointerMove}
          onPointerUp={onSheetPointerUp}
          onPointerCancel={onSheetPointerUp}
        >
          <div className="lb-sheet__grip" aria-hidden="true" />
          <div className="pt-3 pb-3.5">
            <UserSummary size="sheet" />
          </div>
          <hr className="border-line" />
          <ThemeToggle />
          <hr className="border-line" />
          <button
            type="button"
            className="lb-menu__item lb-menu__item--danger text-base"
            onClick={() => void signOut()}
          >
            Sign out
          </button>
        </dialog>
      )}
    </div>
  );
};
