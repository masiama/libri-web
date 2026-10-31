import { Link, createFileRoute } from "@tanstack/react-router";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { isNotFound } from "#/api/mutator";
import { Cover } from "#/components/Cover";
import { ConfusedDino, ShelfDino } from "#/components/Dino";
import {
  Camera,
  CameraOff,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Keyboard,
  SwitchCamera,
  X,
} from "#/components/icons";
import { ScanSweep } from "#/components/Loaders";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import type { BookDTO } from "#/generated/api/models";
import { useBackClick } from "#/lib/back";
import { formatAuthors } from "#/lib/cover";
import { suggestIsbnFix } from "#/lib/ean13";
import { formatIsbn } from "#/lib/isbn";
import { textLang } from "#/lib/lang";

type LookupCardProps = { code: string; looking: boolean; book?: BookDTO; milestone?: number };

const CARD_BOX = "rounded-[20px] p-3.5 md:rounded-3xl md:p-4";

const NotInCatalogue = ({ code }: { code: string }) => (
  <div className={clsx("flex items-center gap-3 bg-(--scan-panel) md:gap-3.5", CARD_BOX)}>
    <ConfusedDino size={56} question={false} className="md:h-auto md:w-16" />
    <div className="min-w-0 flex-1">
      <p className="text-[0.9375rem] font-bold md:text-base">Not in our catalogue</p>
      <p className="text-muted text-[0.8125rem] leading-[1.45] md:text-sm">
        We don’t have this book yet. Try another, or search by title.
      </p>
      <p className="text-muted/70 mt-0.5 font-mono text-xs md:text-[0.8125rem]">
        {formatIsbn(code)}
      </p>
    </div>
  </div>
);

const ALERT_TEXT = "text-danger-text/90 text-[0.8125rem] md:text-sm";

const AlertCard = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
  <div className={clsx("bg-danger-soft flex items-start gap-3", CARD_BOX)}>
    <CircleAlert
      strokeWidth={2.4}
      aria-hidden
      className="text-danger mt-px size-5.5 shrink-0 md:size-6"
    />
    <div className="min-w-0 flex-1">
      <p className="text-danger-text text-[0.9375rem] font-bold md:text-base">{title}</p>
      {children}
    </div>
  </div>
);

const DidYouMean = ({ fix }: { fix: string }) => (
  <>
    Did you mean{" "}
    <span className="font-mono">
      …{fix.slice(9, 12)} {fix[12]}
    </span>
    ?
  </>
);

const Unreadable = ({ fix }: { fix: string }) => (
  <AlertCard title="We can’t read this barcode">
    <p className={clsx(ALERT_TEXT, "mt-0.5 leading-[1.45]")}>
      It isn’t a valid book or store code. Try the barcode on the back cover.
    </p>
    <p className={clsx(ALERT_TEXT, "mt-1")}>
      <DidYouMean fix={fix} />
    </p>
  </AlertCard>
);

const LookupFailed = ({ onRetry }: { onRetry: () => void }) => (
  <AlertCard title="We couldn’t look this up">
    <p className={clsx(ALERT_TEXT, "mt-0.5 leading-[1.45]")}>
      Check your connection, then try again.
    </p>
    <button
      type="button"
      className="lb-btn lb-btn--soft mt-2.5 min-h-(--tap) px-5"
      onClick={onRetry}
    >
      Try again
    </button>
  </AlertCard>
);

const CONFETTI_COLORS = [
  "var(--frog)",
  "var(--found-accent)",
  "var(--on-primary)",
  "var(--primary-soft)",
  "var(--frog)",
  "var(--found-accent)",
  "var(--on-primary)",
  "var(--primary-soft)",
];

const FoundCard = ({ book, milestone }: { book: BookDTO; milestone?: number }) => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!reducedMotion) navigator.vibrate?.(30);
  }, [reducedMotion]);

  return (
    <div className="lb-found">
      {milestone && !reducedMotion && (
        <div className="lb-shelfo">
          <span className="lb-shelfo__tag">{milestone} books. Nice shelf!</span>
          <ShelfDino size={84} className="md:h-auto md:w-27.5" />
        </div>
      )}
      <div aria-hidden className="lb-confetti">
        {CONFETTI_COLORS.map((color, i) => (
          <span
            key={i}
            style={
              {
                "--angle": `${(i * 360) / CONFETTI_COLORS.length}deg`,
                "--color": color,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
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
        <p
          className="line-clamp-2 text-[0.9375rem] font-bold md:text-base"
          lang={textLang(book.title)}
        >
          {book.title}
        </p>
        <p className="truncate text-[0.8125rem] md:text-sm" lang={textLang(book.authors.join(" "))}>
          {formatAuthors(book.authors)}
        </p>
      </div>
      <Link
        to="/books/$isbn"
        params={{ isbn: book.isbn }}
        aria-label={`Open ${book.title}`}
        className="bg-on-primary/18 hover:bg-on-primary/28 flex size-(--tap) shrink-0 items-center justify-center rounded-full"
      >
        <ChevronRight aria-hidden className="size-4.5 stroke-[2.4] md:size-6 md:stroke-2" />
      </Link>
    </div>
  );
};

const LookupCard = ({ code, looking, book, milestone }: LookupCardProps) => {
  if (looking) {
    return (
      <div className={clsx("flex flex-col gap-2.5 bg-(--scan-panel)", CARD_BOX)}>
        <p className="flex justify-between gap-3 text-sm">
          <span className="font-semibold">Looking it up…</span>
          <span className="text-muted font-mono">{formatIsbn(code)}</span>
        </p>
        <ScanSweep label="Looking it up" />
      </div>
    );
  }

  return book ? <FoundCard book={book} milestone={milestone} /> : null;
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
      <X aria-hidden className="size-4.5 stroke-[2.5] md:size-6 md:stroke-2" />
    </Link>
  );
};

const isDesktop = () => matchMedia("(min-width: 68.75rem) and (pointer: fine)").matches;

const ManualField = ({ onFind }: { onFind: (code: string) => void }) => {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<{ fix: string; n: number }>();
  const fix = error?.fix;

  useEffect(() => {
    if (isDesktop()) input.current?.focus();
  }, []);

  return (
    <form
      className="lb-field mx-3 md:mx-0 md:rounded-3xl md:bg-(--scan-panel) md:p-4.5 lg:gap-2.5 lg:rounded-xl lg:p-5.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.current) return;
        const code = input.current.value.replace(/[\s-]/g, "");
        if (!code) return;
        onFind(code);
        const bad = suggestIsbnFix(code);
        setError((prev) => (bad ? { fix: bad, n: (prev?.n ?? 0) + 1 } : undefined));
        if (!bad) e.currentTarget.reset();
        if (isDesktop()) input.current.focus();
      }}
    >
      <label
        htmlFor="manual-code"
        className="lb-field__label xl:font-display pl-1 md:pl-0 md:text-[0.9375rem]"
      >
        <span className="md:hidden">Or type the barcode number</span>
        <span className="max-md:hidden">Type or scan a barcode</span>
      </label>
      <p className="lb-field__hint max-xl:order-last max-md:hidden xl:text-sm">
        <span className="xl:hidden">Bluetooth scanners type here too.</span>
        <span className="max-xl:hidden">
          USB and Bluetooth barcode scanners type straight into this box. Press Enter or Find.
        </span>
      </p>
      <div className="relative">
        <Keyboard
          size={18}
          aria-hidden
          className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 max-[359px]:hidden md:hidden"
        />
        <input
          ref={input}
          id="manual-code"
          className="lb-input lb-input--mono aria-invalid:border-danger h-(--control-h-lg) rounded-md pr-17 pl-10 max-[359px]:pl-4 md:h-13.5 md:bg-(--scan-surface) md:pl-4 md:text-[1.0625rem] xl:h-14 xl:text-lg"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="ISBN or barcode number"
          onInput={() => setError(undefined)}
          aria-invalid={fix ? true : undefined}
          aria-describedby={fix ? "manual-code-error" : undefined}
          onBlur={(e) => {
            if (!e.relatedTarget && isDesktop()) e.currentTarget.focus();
          }}
        />
        <button
          type="submit"
          className="lb-btn lb-btn--primary absolute top-1/2 right-1.5 min-h-(--tap) -translate-y-1/2 rounded-sm px-3.5 text-sm md:px-4 md:text-[0.9375rem] xl:px-4.5"
        >
          Find
        </button>
      </div>
      {error && (
        <p
          key={error.n}
          id="manual-code-error"
          role="alert"
          className="text-danger-text m-0 pl-1 text-[0.8125rem] leading-[1.4] font-semibold md:pl-0"
        >
          Check digit doesn’t match. <DidYouMean fix={error.fix} />
        </p>
      )}
    </form>
  );
};

type CamState = "ask" | "on" | "blocked";

const NOTICE_TEXT = "text-muted max-w-80 text-sm leading-normal md:text-base";

const CameraNotice = ({
  icon: Icon,
  title,
  role,
  danger,
  children,
}: React.PropsWithChildren<{
  icon: typeof Camera;
  title: string;
  role?: "alert";
  danger?: boolean;
}>) => (
  <div
    role={role}
    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center md:gap-3.5 md:p-8"
  >
    <span
      className={clsx(
        "flex size-16 items-center justify-center rounded-lg md:size-18 md:rounded-3xl",
        danger ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-ink",
      )}
    >
      <Icon className="size-7.5 md:size-8.5" aria-hidden />
    </span>
    <h2 className="font-display text-[1.0625rem] leading-[1.3] font-semibold md:text-xl">
      {title}
    </h2>
    {children}
  </div>
);

const HINT = "text-muted absolute inset-x-0 text-center text-[0.8125rem] md:text-[0.9375rem]";

const CARD = "absolute inset-x-3 bottom-3 md:right-auto md:bottom-6 md:left-6 md:w-110";

type ScannedBook = { id: number; book: BookDTO };

const SessionList = ({ rows }: { rows: ScannedBook[] }) => (
  <section
    aria-labelledby="session-title"
    className="flex flex-1 flex-col gap-2 rounded-t-3xl bg-(--scan-list) px-3 py-3.5 md:gap-2.5 md:rounded-3xl md:p-4.5 lg:min-h-0 lg:rounded-xl lg:p-5.5"
  >
    <h2
      id="session-title"
      className="font-display text-[0.8125rem] font-semibold md:text-[0.9375rem]"
    >
      This session
    </h2>
    {rows.length ? (
      <ul className="grid content-start gap-2 md:grid-cols-2 lg:min-h-0 lg:grid-cols-1 lg:overflow-y-auto">
        {rows.map(({ id, book }) => (
          <li
            key={id}
            className="flex min-w-0 items-center gap-2.5 rounded-[14px] bg-(--scan-row) p-1.5 md:gap-3 md:rounded-2xl md:p-2"
          >
            <Cover
              isbn={book.isbn}
              title={book.title}
              authors={book.authors}
              src={getGetImageUrl(book.isbn, { side: "front" })}
              width={32}
              className="md:w-10"
            />
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[0.8125rem] font-semibold md:text-sm"
                lang={textLang(book.title)}
              >
                {book.title}
              </p>
              <p className="text-muted truncate text-xs" lang={textLang(book.authors.join(" "))}>
                {formatAuthors(book.authors)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted text-[0.8125rem] md:text-sm">
        Nothing yet. Your first book will land here.
      </p>
    )}
  </section>
);

const Scan = () => {
  const [scan, setScan] = useState<{ id: number; code: string; typed: boolean }>();
  const scanCode = (code: string, typed = false) =>
    setScan((s) => ({ id: (s?.id ?? 0) + 1, code, typed }));
  const code = scan?.code;
  const fix = code ? suggestIsbnFix(code) : null;
  const lookup = useGetBookByIsbn(code ?? "", {
    query: { enabled: !!code && !fix, retry: (count, err) => !isNotFound(err) && count < 1 },
  });
  const [rows, setRows] = useState<ScannedBook[]>([]);
  if (scan && lookup.data && rows[0]?.id !== scan.id)
    setRows([{ id: scan.id, book: lookup.data }, ...rows]);
  const looking = lookup.isLoading || (lookup.isFetching && lookup.isError);
  const notFound = isNotFound(lookup.error);
  const failed = lookup.isError && !notFound && !looking;
  const cardFix = scan?.typed ? null : fix;
  const reticle = looking ? "locked" : cardFix || failed ? "error" : notFound ? "warn" : undefined;
  const [camera, setCamera] = useState<CamState | undefined>(() =>
    navigator.permissions ? undefined : "ask",
  );
  const [deviceId, setDeviceId] = useState("");
  const cameras = useDevices().filter((d) => d.deviceId);
  const live = camera === "on";
  const cameraOptions = cameras.map((c, i) => (
    <option key={c.deviceId} value={c.deviceId}>
      {c.label || `Camera ${i + 1}`}
    </option>
  ));
  const block = () => {
    setCamera("blocked");
    document.getElementById("manual-code")?.focus();
  };

  useEffect(() => {
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then(({ state }) =>
        state === "denied" ? block() : setCamera(state === "granted" ? "on" : "ask"),
      )
      .catch(() => setCamera("ask"));
  }, []);

  const hint = (text: string) => (!live ? "" : looking ? "Got it" : reticle ? "" : text);

  return (
    <main className="lb-scan flex flex-col pt-4 md:pt-0 lg:h-dvh">
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-(--scan-row) px-3 md:h-18 md:gap-3.5 md:px-7 xl:h-19 xl:gap-4 xl:px-10">
        <CloseLink />
        <h1 className="font-display text-[0.9375rem] font-semibold md:text-[1.1875rem] xl:text-xl">
          Keep scanning
        </h1>
        <p className="lb-chip lb-chip--frog ml-auto py-1.5 md:px-3.5 md:py-1.75 md:text-sm">
          {rows.length} scanned
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3 md:gap-5 md:px-7 md:pt-5 md:pb-7 lg:flex-row xl:gap-8 xl:px-10 xl:py-8">
        <div className="lb-camera mx-3 h-95 shrink-0 md:mx-0 md:h-150 lg:h-auto lg:min-w-0 lg:flex-1">
          {live && (
            <Scanner
              onScan={(detected) => detected[0] && scanCode(detected[0].rawValue)}
              onError={({ kind }) => kind !== "aborted" && block()}
              constraints={deviceId ? { deviceId: { exact: deviceId } } : undefined}
              components={{ finder: false }}
              sound={false}
              styles={{ container: { position: "absolute", inset: 0, aspectRatio: "auto" } }}
            />
          )}
          {live && cameras.length > 1 && (
            <label className="lb-btn lb-btn--icon has-focus-visible:outline-focus absolute top-3 right-3 bg-(--scan-row) has-focus-visible:outline-3 has-focus-visible:outline-offset-2 md:top-4 md:right-4 lg:hidden">
              <SwitchCamera aria-hidden className="size-5 md:size-6" />
              <select
                aria-label="Camera"
                className="absolute inset-0 size-full rounded-full opacity-0"
                value={deviceId || cameras[0].deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              >
                {cameraOptions}
              </select>
            </label>
          )}
          {camera === "ask" && (
            <CameraNotice icon={Camera} title="Let Libri use your camera">
              <p className={clsx(NOTICE_TEXT, "md:max-w-90")}>
                It reads barcodes only while this screen is open. Nothing is recorded.
              </p>

              <button
                type="button"
                className="lb-btn lb-btn--primary mt-1 min-h-12.5 px-6.5 md:min-h-13 md:px-7"
                onClick={() => setCamera("on")}
              >
                Allow camera
              </button>
            </CameraNotice>
          )}
          {camera === "blocked" && (
            <CameraNotice icon={CameraOff} title="Camera is blocked" role="alert" danger>
              <p className={clsx(NOTICE_TEXT, "md:max-w-100")}>
                Allow it in your browser’s site settings, then reload.{" "}
                <span className="lg:hidden">Or type the ISBN below.</span>
                <span className="hidden lg:inline">Or use the ISBN box.</span> A USB or Bluetooth
                scanner works in that box too.
              </p>
            </CameraNotice>
          )}
          {live && (
            <div aria-hidden className="lb-reticle max-md:top-[40%]" data-state={reticle}>
              <span className="lb-reticle__corner" />
              <span className="lb-reticle__corner" />
              <span className="lb-reticle__corner" />
              <span className="lb-reticle__corner" />
              {!reticle && <span className="lb-reticle__laser" />}
            </div>
          )}
          <p className={clsx(HINT, "top-4 md:hidden")}>
            {hint("Point at the barcode on the back")}
          </p>
          <p className={clsx(HINT, "top-5 max-md:hidden xl:top-[70%]")}>
            {hint("Hold the back cover inside the frame")}
          </p>
          <output className={CARD}>
            {code &&
              !fix &&
              !failed &&
              (notFound ? (
                <NotInCatalogue code={code} />
              ) : (
                <LookupCard
                  key={scan.id}
                  code={code}
                  looking={looking}
                  book={lookup.data}
                  milestone={rows.length % 10 === 0 ? rows.length : undefined}
                />
              ))}
          </output>
          <div role="alert" className={CARD}>
            {cardFix ? (
              <Unreadable fix={cardFix} />
            ) : (
              failed && <LookupFailed onRetry={() => void lookup.refetch()} />
            )}
          </div>
        </div>
        <aside className="flex flex-1 flex-col gap-3 md:gap-4 lg:min-h-0 lg:w-95 lg:flex-none xl:w-110 xl:gap-5">
          {cameras.length > 1 && (
            <div className="lb-field gap-2.5 rounded-xl bg-(--scan-panel) p-5.5 max-lg:hidden">
              <label htmlFor="camera-select" className="lb-field__label font-display">
                Camera
              </label>
              <div className="relative">
                <select
                  id="camera-select"
                  className="lb-input h-14 appearance-none rounded-[14px] bg-(--scan-surface) pr-11 text-lg"
                  value={deviceId || cameras[0].deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                >
                  {cameraOptions}
                </select>
                <ChevronDown
                  size={20}
                  aria-hidden
                  className="text-muted pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
                />
              </div>
            </div>
          )}
          <ManualField
            onFind={(found) => {
              if (found === code && lookup.isError) void lookup.refetch();
              scanCode(found, true);
            }}
          />
          <SessionList rows={rows} />
        </aside>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/_authed/scan")({ component: Scan });
