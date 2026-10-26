import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useState, type ReactNode } from "react";

import { ApiError } from "#/api/mutator";
import { Barcode } from "#/components/Barcode";
import { Cover } from "#/components/Cover";
import { ReadingRex } from "#/components/Dino";
import { ArrowUpRight, Check, ChevronLeft, Share } from "#/components/icons";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import { useBackClick } from "#/lib/back";
import { toIsbn13 } from "#/lib/ean13";
import { formatIsbn } from "#/lib/isbn";
import { shareLink } from "#/lib/share";

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

const COVER_WIDTH = "md:w-70 lg:w-75";
const TITLE =
  "lb-title text-2xl leading-[1.2] md:text-[1.875rem] md:leading-[1.18] lg:text-[2.75rem] lg:leading-[1.1] lg:tracking-[-1.2px]";

const BackLink = ({ className }: { className?: string }) => {
  const onBack = useBackClick();
  const { libraryPage = 1, libraryQuery = "" } = useLocation({ select: (l) => l.state });

  return (
    <Link
      to="/"
      search={{ page: libraryPage, q: libraryQuery }}
      className={clsx(
        "lb-btn lb-btn--icon md:w-auto md:gap-1.5 md:pr-4.5 md:pl-3 md:text-[0.9375rem]",
        className,
      )}
      onClick={onBack}
    >
      <ChevronLeft aria-hidden />
      <span className="max-md:sr-only">Library</span>
    </Link>
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

const Hero = ({ busy, cover, details, share, children }: React.PropsWithChildren<HeroProps>) => {
  const libraryPage = useLocation({ select: (l) => l.state.libraryPage });

  return (
    <main className="lg:px-column flex flex-col lg:gap-5 lg:pt-6 lg:pb-16">
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
      <section
        aria-busy={busy}
        className="bg-hero flex flex-col gap-4.5 rounded-b-[36px] bg-[radial-gradient(var(--hero-pattern)_1.6px,transparent_1.8px)] bg-size-[18px_18px] px-4 pt-4 pb-7 md:gap-6 md:rounded-b-[44px] md:px-8 md:pt-5 md:pb-10 lg:rounded-[36px] lg:px-14 lg:py-12"
      >
        <div className="flex justify-between lg:hidden">
          <BackLink className="bg-chrome" />
          {share}
        </div>
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-end md:gap-9 lg:items-center lg:gap-12">
          {cover && <div className="flex shrink-0 justify-center lg:w-105">{cover}</div>}
          <div className="flex flex-col items-center gap-2 text-center md:min-w-0 md:flex-1 md:items-start md:gap-3 md:pb-2 md:text-left lg:gap-3.5 lg:pb-0">
            {children}
          </div>
        </div>
      </section>
      {details && (
        <div className="flex flex-col gap-4 p-5 md:grid md:grid-cols-2 md:items-start md:gap-4.5 md:px-8 md:py-7 lg:grid-cols-[380px_520px] lg:gap-5 lg:p-0">
          {details}
        </div>
      )}
    </main>
  );
};

const BookDetail = () => {
  const { isbn } = Route.useParams();
  const {
    data: book,
    isLoading,
    error,
  } = useGetBookByIsbn(isbn, { query: { retry: (count, err) => !isNotFound(err) && count < 3 } });

  if (isLoading) {
    return (
      <Hero
        busy
        cover={<div className={clsx("lb-skeleton aspect-[1/1.48] w-52.5", COVER_WIDTH)} />}
      >
        <div className="bg-surface-2 h-6 w-3/5 rounded-xs" />
      </Hero>
    );
  }

  if (!book) {
    return (
      <Hero>
        {isNotFound(error) ? (
          <>
            <h1 className={TITLE}>We couldn't find this book</h1>
            <p className="lb-muted m-0">
              Nothing in the library has the code <span className="lb-mono">{isbn}</span>.
            </p>
          </>
        ) : (
          <>
            <h1 className={TITLE}>This book didn't load</h1>
            <p className="lb-muted m-0">Check your connection, then reload the page.</p>
          </>
        )}
      </Hero>
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
      <h1 className={TITLE}>{book.title}</h1>
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
