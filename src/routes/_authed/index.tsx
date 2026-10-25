import { Link, Navigate, createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";

import { BookScannerModal } from "#/components/BookScannerModal";
import { Cover } from "#/components/Cover";
import { ConfusedDino } from "#/components/Dino";
import { ScanIcon } from "#/components/icons";
import { CoverSkeleton } from "#/components/Loaders";
import { Pager } from "#/components/Pager";
import { SearchField } from "#/components/SearchField";
import { getGetImageUrl, useListBooks } from "#/generated/api/endpoints";
import { formatAuthors } from "#/lib/cover";
import { parsePage, parseQuery } from "#/lib/page";

const PAGE_SIZE = 20;

const NoResults = ({ q }: { q: string }) => {
  const [scannerOpen, setScannerOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 px-4 pt-10 text-center">
      <ConfusedDino />
      <h2 className="font-display m-0 text-[1.1875rem] leading-tight font-extrabold wrap-anywhere">
        No books match
        <br />“{q}”
      </h2>
      <p className="lb-muted m-0 max-w-72.5 text-[0.9375rem]">
        Check the spelling, or try just the author’s surname. Got the book in hand? Scan its barcode
        instead.
      </p>
      <button
        type="button"
        className="lb-btn lb-btn--soft mt-2 px-6"
        onClick={() => setScannerOpen(true)}
      >
        <ScanIcon size={20} />
        Scan a book
      </button>
      <BookScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
};

const Library = () => {
  const { page, q } = Route.useSearch();
  const { data, isLoading } = useListBooks({
    filter: q || undefined,
    page: page - 1,
    size: PAGE_SIZE,
  });
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
      {data?.content?.length === 0 ? (
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
                    <div className="lb-book__title">{book.title}</div>
                    <div className="lb-book__author">{formatAuthors(book.authors)}</div>
                  </Link>
                ))}
          </div>
          {lastPage && (
            <Pager
              page={page}
              loading={isLoading}
              totalPages={lastPage}
              totalItems={pageMeta.totalElements ?? 0}
              pageSize={PAGE_SIZE}
            />
          )}
        </>
      )}
    </main>
  );
};

export const Route = createFileRoute("/_authed/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: parsePage(search.page),
    q: parseQuery(search.q),
  }),
  search: { middlewares: [stripSearchParams({ page: 1, q: "" })] },
  component: Library,
});
