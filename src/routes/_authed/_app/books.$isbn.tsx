import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { isNotFound } from "#/api/mutator";
import { Barcode } from "#/components/Barcode";
import { Cover } from "#/components/Cover";
import { ConfusedDino, ReadingRex } from "#/components/Dino";
import { ArrowUpRight, Check, ChevronLeft, CircleAlert, Share } from "#/components/icons";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import { useBackClick } from "#/lib/back";
import { toIsbn13 } from "#/lib/ean13";
import { formatIsbn } from "#/lib/isbn";
import { shareLink } from "#/lib/share";

const COVER_WIDTH = "md:w-70 lg:w-75";
const TITLE =
  "lb-title text-2xl leading-[1.2] md:text-[1.875rem] md:leading-[1.18] lg:text-[2.75rem] lg:leading-[1.1] lg:tracking-[-1.2px]";
const HERO_BAR = "lb-skeleton-text bg-(--hero-pattern)";
const PAGE = "lg:px-column flex flex-col lg:gap-5 lg:pt-6 lg:pb-16";
const STATE_TITLE = "font-display m-0 text-[1.375rem] leading-[1.25] font-extrabold";
const STATE_TEXT = "text-muted m-0 text-[0.9375rem] leading-normal";

const LibraryLink = ({ className, children }: React.PropsWithChildren<{ className?: string }>) => {
  const onBack = useBackClick();
  const { libraryPage = 1, libraryQuery = "" } = useLocation({ select: (l) => l.state });

  return (
    <Link
      to="/"
      search={{ page: libraryPage, q: libraryQuery }}
      className={className}
      onClick={onBack}
    >
      {children}
    </Link>
  );
};

const BackLink = ({ className }: { className?: string }) => (
  <LibraryLink
    className={clsx(
      "lb-btn lb-btn--icon md:w-auto md:gap-1.5 md:pr-4.5 md:pl-3 md:text-[0.9375rem]",
      className,
    )}
  >
    <ChevronLeft aria-hidden />
    <span className="max-md:sr-only">Library</span>
  </LibraryLink>
);

const Breadcrumb = () => {
  const libraryPage = useLocation({ select: (l) => l.state.libraryPage });

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted flex items-center gap-2 text-sm max-lg:hidden"
    >
      <BackLink className="bg-surface min-h-10 shadow-sm" />
      {libraryPage && (
        <>
          <span aria-hidden="true">·</span>
          <span>Page {libraryPage}</span>
        </>
      )}
    </nav>
  );
};

const useCopied = () => {
  const [copiedAt, setCopiedAt] = useState(0);

  useEffect(() => {
    if (!copiedAt) return;
    const timer = setTimeout(() => setCopiedAt(0), 2000);
    return () => clearTimeout(timer);
  }, [copiedAt]);

  return [copiedAt > 0, (copied: boolean) => setCopiedAt(copied ? Date.now() : 0)] as const;
};

const ShareButton = ({ title, labelled }: { title: string; labelled?: boolean }) => {
  const [copied, setCopied] = useCopied();
  const Icon = copied ? Check : Share;

  const share = async () => {
    const result = await shareLink({ title, url: window.location.href });
    if (result !== "cancelled") setCopied(result === "copied");
  };

  return (
    <>
      {labelled ? (
        <button
          type="button"
          className="lb-btn lb-btn--lg bg-surface text-ink pr-5 pl-4 shadow-sm"
          onClick={share}
        >
          <Icon size={20} aria-hidden />
          {copied ? "Copied" : "Share"}
        </button>
      ) : (
        <button
          type="button"
          aria-label="Share"
          className="lb-btn lb-btn--icon bg-chrome"
          onClick={share}
        >
          <Icon aria-hidden />
        </button>
      )}
      <output className="lb-sr-only">{copied && "Link copied"}</output>
    </>
  );
};

const IsbnCard = ({ isbn }: { isbn: string }) => {
  const [copied, setCopied] = useCopied();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(isbn);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="lb-card flex min-h-16 items-center gap-3 rounded-lg py-2.5 pr-2.5 pl-5">
      <div className="min-w-0 flex-1">
        <div className="text-muted text-[0.8125rem]">ISBN</div>
        <div className="font-mono text-[1.0625rem] font-medium tracking-[0.5px]">
          {formatIsbn(isbn)}
        </div>
      </div>
      <button type="button" className="lb-btn lb-btn--soft min-h-11 px-4.5 text-sm" onClick={copy}>
        {copied && <Check size={16} aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
      <output className="lb-sr-only">{copied && "ISBN copied"}</output>
    </div>
  );
};

const BarcodeCard = ({ isbn, coverSrc }: { isbn: string; coverSrc: string }) => {
  const isbn13 = toIsbn13(isbn);
  if (!isbn13) return null;

  return (
    <div className="lb-card flex items-center gap-3 rounded-3xl pt-4.5 pr-4.5 pb-3.5 pl-5">
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 md:gap-2">
        <h2 className="text-muted text-xs font-semibold tracking-[0.6px] uppercase">
          This book’s real barcode
        </h2>
        <Barcode code={isbn13} module={1.6} height={52} />
        <p className="text-muted m-0 text-[0.8125rem]">Yes, you can scan this one too.</p>
      </div>
      <ReadingRex isbn={isbn} coverSrc={coverSrc} className="shrink-0 self-end" />
    </div>
  );
};

type HeroProps = { busy?: boolean; cover?: ReactNode; details?: ReactNode; share?: ReactNode };

const Hero = ({ busy, cover, details, share, children }: React.PropsWithChildren<HeroProps>) => (
  <main className={PAGE}>
    <Breadcrumb />
    <section className="bg-hero flex flex-col gap-4.5 rounded-b-[36px] bg-[radial-gradient(var(--hero-pattern)_1.6px,transparent_1.8px)] bg-size-[18px_18px] px-4 pt-4 pb-7 md:gap-6 md:rounded-b-[44px] md:px-8 md:pt-5 md:pb-10 lg:rounded-[36px] lg:px-14 lg:py-12">
      <div className="flex justify-between lg:hidden">
        <BackLink className="bg-chrome" />
        {share}
      </div>
      <div
        aria-busy={busy}
        className="flex flex-col items-center gap-5 md:flex-row md:items-end md:gap-9 lg:items-center lg:gap-12"
      >
        {cover && <div className="flex shrink-0 justify-center lg:w-105">{cover}</div>}
        <div className="flex flex-col items-center gap-2 text-center max-md:self-stretch md:min-w-0 md:flex-1 md:items-start md:gap-3 md:pb-2 md:text-left lg:gap-3.5 lg:pb-0">
          {children}
        </div>
      </div>
    </section>
    {details && (
      <div
        aria-busy={busy}
        className="flex flex-col gap-4 p-5 md:grid md:grid-cols-2 md:items-start md:gap-4.5 md:px-8 md:py-7 lg:grid-cols-[380px_520px] lg:gap-5 lg:p-0"
      >
        {details}
      </div>
    )}
  </main>
);

const CardSkeleton = ({ className }: { className: string }) => (
  <div className={clsx("lb-card flex flex-col justify-center gap-2.5 px-5 py-0", className)}>
    <div className="lb-skeleton-text w-[30%]" />
    <div className="lb-skeleton-text w-3/5" />
  </div>
);

const StatePage = ({ alert, children }: React.PropsWithChildren<{ alert?: boolean }>) => (
  <main className={clsx(PAGE, "p-4 md:px-8 md:pt-5")}>
    <Breadcrumb />
    <BackLink className="bg-chrome md:bg-surface self-start md:shadow-sm lg:hidden" />
    <div role={alert ? "alert" : undefined} className="lb-state">
      {children}
    </div>
  </main>
);

const BookDetail = () => {
  const { isbn } = Route.useParams();
  const {
    data: book,
    isFetching,
    error,
    refetch,
  } = useGetBookByIsbn(isbn, { query: { retry: (count, err) => !isNotFound(err) && count < 3 } });
  const retried = useRef(false);
  const focusAfterRetry = (el: HTMLElement | null) => {
    if (!el || !retried.current) return;
    retried.current = false;
    el.focus();
  };

  if (!book && isFetching && !isNotFound(error)) {
    return (
      <Hero
        busy
        cover={<div className={clsx("lb-skeleton aspect-[1/1.48] w-52.5", COVER_WIDTH)} />}
        details={
          <>
            <CardSkeleton className="h-16 rounded-lg" />
            <CardSkeleton className="h-35 rounded-3xl" />
          </>
        }
        share={<div className={clsx(HERO_BAR, "size-11 rounded-full")} />}
      >
        <div className="flex w-full flex-col items-center gap-2.5 md:items-start md:gap-3.5 lg:gap-4">
          <div className={clsx(HERO_BAR, "h-3.5 w-[70%] md:h-4.5 md:w-[85%] lg:h-7.5 lg:w-3/5")} />
          <div className={clsx(HERO_BAR, "h-4.5 w-[55%] max-md:hidden lg:hidden")} />
          <div className={clsx(HERO_BAR, "h-2.5 w-2/5 md:h-3 md:w-[35%] lg:h-3.5 lg:w-[30%]")} />
          <div className="mt-2 flex w-full gap-3 md:mt-0 md:w-auto lg:mt-2">
            <div className={clsx(HERO_BAR, "h-13 w-full rounded-full md:w-55")} />
            <div className={clsx(HERO_BAR, "h-13 w-30 rounded-full max-lg:hidden")} />
          </div>
        </div>
      </Hero>
    );
  }

  if (!book) {
    return isNotFound(error) ? (
      <StatePage>
        <ConfusedDino size={120} />
        <h1 ref={focusAfterRetry} tabIndex={-1} className={STATE_TITLE}>
          We couldn’t find this book
        </h1>
        <p className={STATE_TEXT}>
          It isn’t in our catalogue yet. Try another book, or search by title.
        </p>
        <LibraryLink className="lb-btn lb-btn--soft mt-1.5 px-5.5 text-[0.9375rem]">
          Back to library
        </LibraryLink>
      </StatePage>
    ) : (
      <StatePage alert>
        <div className="lb-state__icon">
          <CircleAlert size={30} aria-hidden />
        </div>
        <h1 className={STATE_TITLE}>This book didn’t load</h1>
        <p className={STATE_TEXT}>
          Something went wrong on our side or with your connection. Try again in a moment.
        </p>
        <button
          ref={focusAfterRetry}
          type="button"
          className="lb-btn lb-btn--primary mt-1.5 px-6 text-[0.9375rem]"
          onClick={() => {
            retried.current = true;
            void refetch();
          }}
        >
          Try again
        </button>
      </StatePage>
    );
  }

  const coverSrc = getGetImageUrl(book.isbn, { side: "front" });

  return (
    <Hero
      cover={
        <div className="rounded-(--radius-cover) shadow-(--shadow-cover)">
          <Cover
            isbn={book.isbn}
            title={book.title}
            authors={book.authors}
            src={coverSrc}
            width={210}
            priority
            className={COVER_WIDTH}
          />
        </div>
      }
      details={
        <>
          <IsbnCard isbn={book.isbn} />
          <BarcodeCard isbn={book.isbn} coverSrc={coverSrc} />
        </>
      }
      share={<ShareButton title={book.title} />}
    >
      <h1 ref={focusAfterRetry} tabIndex={-1} className={TITLE}>
        {book.title}
      </h1>
      {book.authors.length > 0 && (
        <p className="text-primary-ink m-0 text-[1.0625rem] font-semibold md:text-[1.1875rem] lg:text-xl">
          {book.authors.join(", ")}
        </p>
      )}
      <div
        className={clsx(
          "mt-2.5 flex flex-wrap gap-3 max-md:self-stretch md:mt-1.5 lg:mt-2",
          !book.url && "max-lg:hidden",
        )}
      >
        <a
          href={book.url}
          target="_blank"
          rel="noopener noreferrer"
          className="lb-btn lb-btn--lg lb-btn--primary pr-5 pl-5.5 font-bold whitespace-nowrap max-md:w-full"
        >
          Buy on {book.sourceName}
          <ArrowUpRight size={18} strokeWidth={2.4} aria-hidden />{" "}
          <span className="lb-sr-only">(opens in a new tab)</span>
        </a>
        <div className="max-lg:hidden">
          <ShareButton title={book.title} labelled />
        </div>
      </div>
    </Hero>
  );
};

export const Route = createFileRoute("/_authed/_app/books/$isbn")({ component: BookDetail });
