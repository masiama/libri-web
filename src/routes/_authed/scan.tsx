import { Link, createFileRoute } from "@tanstack/react-router";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { Cover } from "#/components/Cover";
import { ChevronRight, Keyboard, X } from "#/components/icons";
import { ScanSweep } from "#/components/Loaders";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import type { BookDTO } from "#/generated/api/models";
import { useBackClick } from "#/lib/back";
import { formatAuthors } from "#/lib/cover";
import { formatIsbn } from "#/lib/isbn";

type LookupCardProps = { code: string; looking: boolean; book?: BookDTO };

const LookupCard = ({ code, looking, book }: LookupCardProps) => {
  if (looking) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[20px] bg-(--scan-panel) p-3.5">
        <p className="flex justify-between gap-3 text-sm">
          <span className="font-semibold">Looking it up…</span>
          <span className="text-muted font-mono">{formatIsbn(code)}</span>
        </p>
        <ScanSweep label="Looking it up" />
      </div>
    );
  }

  if (!book)
    return (
      <p className="rounded-[20px] bg-(--scan-panel) p-3.5 text-sm">
        No book found for code {code}.
      </p>
    );

  return (
    <div className="lb-found">
      <Cover
        isbn={book.isbn}
        title={book.title}
        authors={book.authors}
        src={getGetImageUrl(book.isbn, { side: "front" })}
        width={56}
        className="md:w-16"
      />
      <div className="min-w-0 flex-1">
        <p className="lb-found__title md:text-[1.375rem]">Found!</p>
        <p className="line-clamp-2 text-[0.9375rem] font-bold md:text-base">{book.title}</p>
        <p className="truncate text-[0.8125rem] opacity-90 md:text-sm">
          {formatAuthors(book.authors)}
        </p>
      </div>
      <Link
        to="/books/$isbn"
        params={{ isbn: book.isbn }}
        aria-label={`Open ${book.title}`}
        className="bg-on-primary/18 hover:bg-on-primary/28 flex size-(--tap) shrink-0 items-center justify-center rounded-full"
      >
        <ChevronRight size={20} strokeWidth={2.4} aria-hidden />
      </Link>
    </div>
  );
};

const CloseLink = () => {
  const onBack = useBackClick();

  return (
    <Link
      to="/"
      search={{ page: 1, q: "" }}
      aria-label="Close scanner"
      className="lb-btn lb-btn--icon bg-(--scan-row)"
      onClick={onBack}
    >
      <X size={18} strokeWidth={2.5} aria-hidden />
    </Link>
  );
};

const isDesktop = () => matchMedia("(min-width: 68.75rem) and (pointer: fine)").matches;

const ManualField = ({ onFind }: { onFind: (code: string) => void }) => {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDesktop()) input.current?.focus();
  }, []);

  return (
    <form
      className="lb-field gap-2 md:rounded-3xl md:bg-(--scan-panel) md:p-4.5 lg:gap-2.5 lg:rounded-xl lg:p-5.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.current) return;
        const code = input.current.value.replace(/[\s-]/g, "");
        if (!code) return;
        onFind(code);
        input.current.value = "";
        if (isDesktop()) input.current.focus();
      }}
    >
      <label
        htmlFor="manual-code"
        className="lb-field__label lg:font-display pl-1 md:pl-0 md:text-[0.9375rem]"
      >
        <span className="md:hidden">Or type the barcode number</span>
        <span className="max-md:hidden">Type or scan a barcode</span>
      </label>
      <p className="lb-field__hint max-lg:order-last max-md:hidden lg:text-sm">
        <span className="lg:hidden">Bluetooth scanners type here too.</span>
        <span className="max-lg:hidden">
          USB and Bluetooth barcode scanners type straight into this box. Press Enter to find it.
        </span>
      </p>
      <div className="relative">
        <Keyboard
          size={18}
          aria-hidden
          className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 md:hidden"
        />
        <input
          ref={input}
          id="manual-code"
          className="lb-input lb-input--mono h-(--control-h-lg) pr-21 pl-10 md:h-13.5 md:bg-(--scan-surface) md:pl-4 md:text-[1.0625rem] lg:h-14 lg:text-lg"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="ISBN or barcode number"
          onBlur={(e) => {
            if (!e.relatedTarget && isDesktop()) e.currentTarget.focus();
          }}
        />
        <button
          type="submit"
          className="lb-btn lb-btn--primary absolute top-1/2 right-1.5 min-h-(--tap) -translate-y-1/2 rounded-sm px-3.5 text-sm md:px-4 md:text-[0.9375rem]"
        >
          Find
        </button>
      </div>
    </form>
  );
};

const HINT = "text-muted absolute inset-x-0 text-center text-[0.8125rem] md:text-[0.9375rem]";

const Scan = () => {
  const [code, setCode] = useState<string>();
  const lookup = useGetBookByIsbn(code ?? "", { query: { enabled: !!code } });
  const looking = lookup.isLoading;
  const hint = (text: string) => (looking ? "Got it" : text);

  return (
    <main className="lb-scan flex flex-col pt-4 md:pt-0 lg:h-dvh">
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-(--scan-row) px-3 md:h-18 md:gap-3.5 md:px-7 lg:h-19 lg:gap-4 lg:px-10">
        <CloseLink />
        <h1 className="font-display text-[0.9375rem] font-semibold md:text-[1.1875rem] lg:text-xl">
          Keep scanning
        </h1>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3 md:gap-5 md:px-7 md:pt-5 md:pb-7 lg:flex-row lg:gap-8 lg:px-10 lg:py-8">
        <div className="lb-camera mx-3 h-95 shrink-0 md:mx-0 md:h-150 lg:h-auto lg:min-w-0 lg:flex-1">
          <Scanner
            onScan={(detected) => setCode(detected[0]?.rawValue)}
            components={{ finder: false }}
            sound={false}
            styles={{ container: { position: "absolute", inset: 0, aspectRatio: "auto" } }}
          />
          <div
            aria-hidden
            className="lb-reticle max-md:top-[40%] lg:w-90"
            data-state={looking ? "locked" : undefined}
          >
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            {!looking && <span className="lb-reticle__laser" />}
          </div>
          <p className={clsx(HINT, "top-4 md:hidden")}>
            {hint("Point at the barcode on the back")}
          </p>
          <p className={clsx(HINT, "top-5 max-md:hidden lg:hidden")}>
            {hint("Hold the back cover inside the frame")}
          </p>
          <p className={clsx(HINT, "top-[70%] max-lg:hidden")}>
            {hint("Hold the back cover up to your webcam")}
          </p>
          <output className="absolute inset-x-3 bottom-3 md:right-auto md:bottom-5 md:left-5 md:w-100 lg:bottom-6 lg:left-6 lg:w-105">
            {code && <LookupCard code={code} looking={looking} book={lookup.data} />}
          </output>
        </div>
        <aside className="mx-3 flex flex-col gap-3 md:mx-0 md:gap-4 lg:w-95 lg:shrink-0 lg:gap-5 xl:w-110">
          <ManualField onFind={setCode} />
        </aside>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/_authed/scan")({ component: Scan });
