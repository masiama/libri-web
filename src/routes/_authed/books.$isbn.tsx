import {
  Link,
  createFileRoute,
  useCanGoBack,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import clsx from "clsx";
import type { ReactNode } from "react";

import { ApiError } from "#/api/mutator";
import { Cover } from "#/components/Cover";
import { ChevronLeft } from "#/components/icons";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";

const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

const COVER_WIDTH = "md:w-70 lg:w-75";
const TITLE =
  "lb-title text-2xl leading-[1.2] md:text-[1.875rem] md:leading-[1.18] lg:text-[2.75rem] lg:leading-[1.1] lg:tracking-[-1.2px]";

const BackLink = ({ page, className }: { page?: number; className?: string }) => {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <Link
      to="/"
      search={{ page: page ?? 1 }}
      className={clsx(
        "lb-btn lb-btn--icon bg-surface md:w-auto md:gap-1.5 md:pr-4.5 md:pl-3 md:text-[0.9375rem]",
        className,
      )}
      onClick={(e) => {
        if (!canGoBack) return;
        e.preventDefault();
        router.history.back();
      }}
    >
      <ChevronLeft aria-hidden />
      <span className="max-md:sr-only">Library</span>
    </Link>
  );
};

type HeroProps = { busy?: boolean; cover?: ReactNode };

const Hero = ({ busy, cover, children }: React.PropsWithChildren<HeroProps>) => {
  const libraryPage = useLocation({ select: (l) => l.state.libraryPage });

  return (
    <main className="lg:px-column flex flex-col lg:gap-5 lg:pt-6 lg:pb-16">
      <nav
        aria-label="Breadcrumb"
        className="text-muted flex items-center gap-2 text-sm max-lg:hidden"
      >
        <BackLink page={libraryPage} className="min-h-10 shadow-sm" />
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
        <BackLink page={libraryPage} className="self-start lg:hidden" />
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-end md:gap-9 lg:items-center lg:gap-12">
          {cover && <div className="flex shrink-0 justify-center lg:w-105">{cover}</div>}
          <div className="flex flex-col items-center gap-2 text-center md:min-w-0 md:flex-1 md:items-start md:gap-3 md:pb-2 md:text-left lg:gap-3.5 lg:pb-0">
            {children}
          </div>
        </div>
      </section>
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

  return (
    <Hero
      cover={
        <div className="rounded-(--radius-cover) shadow-(--shadow-cover)">
          <Cover
            isbn={book.isbn}
            title={book.title}
            authors={book.authors}
            src={getGetImageUrl(book.isbn, { side: "front" })}
            width={210}
            priority
            className={COVER_WIDTH}
          />
        </div>
      }
    >
      <h1 className={TITLE}>{book.title}</h1>
      {book.authors.length > 0 && (
        <p className="text-primary-ink m-0 text-[1.0625rem] font-semibold md:text-[1.1875rem] lg:text-xl">
          {book.authors.join(", ")}
        </p>
      )}
    </Hero>
  );
};

export const Route = createFileRoute("/_authed/books/$isbn")({ component: BookDetail });
