import { Link, createFileRoute } from "@tanstack/react-router";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { isNotFound } from "#/api/mutator";
import { Cover } from "#/components/Cover";
import { ConfusedDino } from "#/components/Dino";
import {
  Camera,
  CameraOff,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Keyboard,
  X,
} from "#/components/icons";
import { ScanSweep } from "#/components/Loaders";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import type { BookDTO } from "#/generated/api/models";
import { useBackClick } from "#/lib/back";
import { formatAuthors } from "#/lib/cover";
import { suggestIsbnFix } from "#/lib/ean13";
import { formatIsbn } from "#/lib/isbn";

type LookupCardProps = { code: string; looking: boolean; book?: BookDTO };

const NotInCatalogue = ({ code }: { code: string }) => (
  <div className="flex items-center gap-3 rounded-[20px] bg-(--scan-panel) p-3.5">
    <ConfusedDino size={56} question={false} />
    <div className="min-w-0 flex-1">
      <p className="text-[0.9375rem] font-bold">Not in our catalogue</p>
      <p className="text-muted text-[0.8125rem] leading-[1.45]">
        We don’t have this book yet. Try another, or search by title.
      </p>
      <p className="text-muted/70 mt-0.5 font-mono text-xs">{formatIsbn(code)}</p>
    </div>
  </div>
);

const Unreadable = ({ fix }: { fix: string }) => (
  <div className="bg-danger-soft flex items-start gap-3 rounded-[20px] p-3.5">
    <CircleAlert size={22} strokeWidth={2.4} aria-hidden className="text-danger mt-px shrink-0" />
    <div>
      <p className="text-danger-text text-[0.9375rem] font-bold">We can’t read this barcode</p>
      <p className="text-danger-text/90 mt-0.5 text-[0.8125rem] leading-[1.45]">
        It isn’t a valid book or store code. Try the barcode on the back cover.
      </p>
      <p className="text-danger-text/90 mt-1 text-[0.8125rem]">
        Did you mean{" "}
        <span className="font-mono">
          …{fix.slice(9, 12)} {fix[12]}
        </span>
        ?
      </p>
    </div>
  </div>
);

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
      className="lb-field mx-3 gap-2 md:mx-0 md:rounded-3xl md:bg-(--scan-panel) md:p-4.5 lg:gap-2.5 lg:rounded-xl lg:p-5.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.current) return;
        const code = input.current.value.replace(/[\s-]/g, "");
        if (!code) return;
        onFind(code);
        e.currentTarget.reset();
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

type CamState = "ask" | "on" | "blocked";

const NOTICE_TEXT = "text-muted max-w-80 text-[0.8125rem] leading-[1.45] md:text-[0.9375rem]";

const CameraNotice = ({
  icon: Icon,
  title,
  role,
  children,
}: React.PropsWithChildren<{ icon: typeof Camera; title: string; role?: "alert" }>) => (
  <div
    role={role}
    className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-6 text-center"
  >
    <span className="flex size-14 items-center justify-center rounded-full bg-(--scan-row)">
      <Icon size={26} aria-hidden />
    </span>
    <h2 className="font-display text-base font-semibold md:text-lg">{title}</h2>
    {children}
  </div>
);

const HINT = "text-muted absolute inset-x-0 text-center text-[0.8125rem] md:text-[0.9375rem]";

const CARD =
  "absolute inset-x-3 bottom-3 md:right-auto md:bottom-5 md:left-5 md:w-100 lg:bottom-6 lg:left-6 lg:w-105";

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
      <ul className="grid content-start gap-2 md:grid-cols-2 lg:min-h-0 lg:grid-cols-1 lg:gap-2.5 lg:overflow-y-auto">
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
              <p className="truncate text-[0.8125rem] font-semibold md:text-sm">{book.title}</p>
              <p className="text-muted truncate text-xs">{formatAuthors(book.authors)}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-muted text-[0.8125rem]">Nothing yet. Your first book will land here.</p>
    )}
  </section>
);

const Scan = () => {
  const [scan, setScan] = useState<{ id: number; code: string }>();
  const scanCode = (code: string) => setScan((s) => ({ id: (s?.id ?? 0) + 1, code }));
  const code = scan?.code;
  const fix = code ? suggestIsbnFix(code) : null;
  const lookup = useGetBookByIsbn(code ?? "", {
    query: { enabled: !!code && !fix, retry: (count, err) => !isNotFound(err) && count < 3 },
  });
  const [rows, setRows] = useState<ScannedBook[]>([]);
  if (scan && lookup.data && rows[0]?.id !== scan.id)
    setRows([{ id: scan.id, book: lookup.data }, ...rows]);
  const looking = lookup.isLoading;
  const notFound = isNotFound(lookup.error);
  const reticle = looking ? "locked" : fix ? "error" : notFound ? "warn" : undefined;
  const [camera, setCamera] = useState<CamState | undefined>(() =>
    navigator.permissions ? undefined : "ask",
  );
  const [deviceId, setDeviceId] = useState("");
  const cameras = useDevices().filter((d) => d.deviceId);
  const live = camera === "on";
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
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-(--scan-row) px-3 md:h-18 md:gap-3.5 md:px-7 lg:h-19 lg:gap-4 lg:px-10">
        <CloseLink />
        <h1 className="font-display text-[0.9375rem] font-semibold md:text-[1.1875rem] lg:text-xl">
          Keep scanning
        </h1>
        <p className="lb-chip lb-chip--frog ml-auto py-1.5 md:px-3.5 md:py-1.75 md:text-sm">
          {rows.length} scanned
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3 md:gap-5 md:px-7 md:pt-5 md:pb-7 lg:flex-row lg:gap-8 lg:px-10 lg:py-8">
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
          {camera === "ask" && (
            <CameraNotice icon={Camera} title="Let Libri use your camera">
              <p className={NOTICE_TEXT}>
                It reads barcodes only while this screen is open. Nothing is recorded.
              </p>

              <button
                type="button"
                className="lb-btn lb-btn--primary mt-1"
                onClick={() => setCamera("on")}
              >
                Allow camera
              </button>
            </CameraNotice>
          )}
          {camera === "blocked" && (
            <CameraNotice icon={CameraOff} title="Camera is blocked" role="alert">
              <p className={NOTICE_TEXT}>
                Allow the camera in your browser’s site settings, then reload. Or type the ISBN
                below.
              </p>
            </CameraNotice>
          )}
          {live && (
            <div aria-hidden className="lb-reticle max-md:top-[40%] lg:w-90" data-state={reticle}>
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
          <p className={clsx(HINT, "top-5 max-md:hidden lg:hidden")}>
            {hint("Hold the back cover inside the frame")}
          </p>
          <p className={clsx(HINT, "top-[70%] max-lg:hidden")}>
            {hint("Hold the back cover up to your webcam")}
          </p>
          <output className={CARD}>
            {code &&
              !fix &&
              (notFound ? (
                <NotInCatalogue code={code} />
              ) : (
                <LookupCard code={code} looking={looking} book={lookup.data} />
              ))}
          </output>
          <div role="alert" className={CARD}>
            {fix && <Unreadable fix={fix} />}
          </div>
        </div>
        <aside className="flex flex-1 flex-col gap-3 md:gap-4 lg:min-h-0 lg:w-95 lg:flex-none lg:gap-5 xl:w-110">
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
                  {cameras.map((c, i) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={20}
                  aria-hidden
                  className="text-muted pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
                />
              </div>
            </div>
          )}
          <ManualField onFind={scanCode} />
          <SessionList rows={rows} />
        </aside>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/_authed/scan")({ component: Scan });
