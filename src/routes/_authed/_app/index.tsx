import { Link, Navigate, createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Cover } from "#/components/Cover";
import { ConfusedDino } from "#/components/Dino";
import { ScanIcon } from "#/components/icons";
import { CoverSkeleton } from "#/components/Loaders";
import { LoadFailed } from "#/components/LoadFailed";
import { Pager } from "#/components/Pager";
import { SearchField } from "#/components/SearchField";
import { getGetImageUrl, useListBooks } from "#/generated/api/endpoints";
import { formatAuthors } from "#/lib/cover";
import { textLang } from "#/lib/lang";
import { parsePage, parseQuery } from "#/lib/page";

const PAGE_SIZE = 20;

const NoResults = ({ q }: { q: string }) => (
  <div className="flex flex-col items-center gap-3 px-2 pt-8 text-center md:pt-16">
    <ConfusedDino />
    <h2 className="font-display m-0 max-w-140 text-[1.1875rem] leading-[1.3] font-extrabold wrap-anywhere md:text-2xl">
      No books match “{q}”
    </h2>
    <p className="lb-muted m-0 max-w-75 text-[0.9375rem] md:max-w-90 md:text-base">
      Check the spelling, or try just the author’s surname. Got the book in hand? Scan its barcode
      instead.
    </p>
    <Link to="/scan" className="lb-btn lb-btn--soft mt-2 px-6">
      <ScanIcon size={20} />
      Scan a book
    </Link>
  </div>
);

const Library = () => {
  const { page, q } = Route.useSearch();
  const { data, isFetching, isError, refetch } = useListBooks(
    { filter: q || undefined, page: page - 1, size: PAGE_SIZE },
    { query: { retry: 2 } },
  );
  const isLoading = isFetching && !data;
  const retried = useRef(false);
  const focusAfterRetry = (el: HTMLButtonElement | null) => {
    if (!el || !retried.current) return;
    retried.current = false;
    el.focus();
  };
  const [lastMeta, setLastMeta] = useState({ q, meta: data?.page });
  if (data?.page && (lastMeta.q !== q || lastMeta.meta !== data.page))
    setLastMeta({ q, meta: data.page });
  const pageMeta = data?.page ?? (lastMeta.q === q ? lastMeta.meta : undefined);
  const total = pageMeta?.totalElements;
  const lastPage = pageMeta && Math.max(1, pageMeta.totalPages ?? 1);

  if (lastPage && page > lastPage)
    return <Navigate to="/" search={{ page: lastPage, q }} replace />;

  return (
    <main className="lg:px-column flex flex-col gap-4 px-5 pt-5 pb-8 md:gap-6 md:px-8 md:pt-7 md:pb-10 lg:pt-8 lg:pb-16">
      <div className="flex items-center gap-2.5 md:gap-3">
        <h1 className="lb-title md:text-[1.875rem] lg:text-[2rem]">Library</h1>
        <output className="lb-chip empty:hidden">
          {total !== undefined && `${total} ${q ? "results" : "books"}`}
        </output>
      </div>
      <SearchField className="md:hidden" />
      {isError && !data ? (
        <div role="alert" className="lb-state">
          <LoadFailed
            title={q ? "The search didn’t work" : "The library didn’t load"}
            buttonRef={focusAfterRetry}
            onRetry={() => {
              retried.current = true;
              void refetch();
            }}
          />
        </div>
      ) : data?.content?.length === 0 ? (
        <NoResults q={q} />
      ) : (
        <>
          <div className="lb-grid" aria-busy={isLoading}>
            {isLoading
              ? Array.from({ length: PAGE_SIZE }, (_, i) => <CoverSkeleton key={i} />)
              : data?.content?.map((book) => (
                  <Link
                    key={book.isbn}
                    to="/books/$isbn"
                    params={{ isbn: book.isbn }}
                    state={{ libraryPage: page, libraryQuery: q }}
                    className="lb-book"
                  >
                    <Cover
                      isbn={book.isbn}
                      title={book.title}
                      authors={book.authors}
                      src={getGetImageUrl(book.isbn, { side: "front" })}
                      width={107}
                      className="w-full"
                    />
                    <div className="lb-book__title" lang={textLang(book.title)}>
                      {book.title}
                    </div>
                    <div className="lb-book__author" lang={textLang(book.authors.join(" "))}>
                      {formatAuthors(book.authors)}
                    </div>
                  </Link>
                ))}
          </div>
          {(lastPage || isLoading) && (
            <Pager
              page={page}
              loading={isLoading}
              totalPages={lastPage}
              totalItems={pageMeta?.totalElements ?? 0}
              pageSize={PAGE_SIZE}
            />
          )}
        </>
      )}
    </main>
  );
};

export const Route = createFileRoute("/_authed/_app/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: parsePage(search.page),
    q: parseQuery(search.q),
  }),
  search: { middlewares: [stripSearchParams({ page: 1, q: "" })] },
  component: Library,
});
