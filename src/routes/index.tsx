import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { Navigate, createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useState } from "react";

import { BookScannerModal } from "#/components/BookScannerModal";
import { Cover } from "#/components/Cover";
import { ScanIcon } from "#/components/icons";
import { CoverSkeleton } from "#/components/Loaders";
import { Logo } from "#/components/Logo";
import { Pager } from "#/components/Pager";
import { getGetImageUrl, useListBooks } from "#/generated/api/endpoints";
import { formatAuthors } from "#/lib/cover";
import { parsePage } from "#/lib/page";

const PAGE_SIZE = 20;

const BookList = () => {
  const { page } = Route.useSearch();
  const { data, isLoading } = useListBooks({ page: page - 1, size: PAGE_SIZE });
  const pageMeta = data?.page;
  const lastPage = pageMeta && Math.max(1, pageMeta.totalPages ?? 1);

  if (lastPage && page > lastPage) return <Navigate to="/" search={{ page: lastPage }} replace />;

  return (
    <>
      <div className="flex items-center gap-2.5 md:gap-3">
        <h1 className="lb-title md:text-[1.875rem] lg:text-[2rem]">Library</h1>
        {pageMeta && <span className="lb-chip">{pageMeta.totalElements} books</span>}
      </div>
      <div className="lb-grid" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }, (_, i) => <CoverSkeleton key={i} />)
          : data?.content?.map((book) => (
              <div key={book.isbn} className="lb-book">
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
              </div>
            ))}
      </div>
      <Pager
        page={page}
        totalPages={lastPage}
        totalItems={pageMeta?.totalElements}
        pageSize={PAGE_SIZE}
      />
    </>
  );
};

const Home = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [scannerOpen, setScannerOpen] = useState(false);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <SignInButton mode="modal">
          <button type="button" className="lb-btn lb-btn--primary">
            Sign in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <>
      <header className="lb-header lg:px-column">
        <Logo className="size-7 md:size-8" />
        <span className="lb-wordmark md:text-[1.25rem]">libri</span>
        <button
          type="button"
          className="lb-btn lb-btn--frog ml-auto min-h-11 pr-4 pl-3 text-[0.9375rem] md:min-h-12 md:pr-5 md:pl-4"
          onClick={() => setScannerOpen(true)}
        >
          <ScanIcon size={20} className="md:size-5.5" />
          <span className="lg:hidden">Scan</span>
          <span className="max-lg:hidden">Scan books</span>
        </button>
        <SignOutButton>
          <button type="button" className="lb-btn lb-btn--outline">
            Sign out
          </button>
        </SignOutButton>
      </header>
      <main className="lg:px-column flex flex-col gap-4 px-5 pt-5 pb-8 md:gap-6 md:px-8 md:pt-7 lg:pt-8 lg:pb-16">
        <p>{user.primaryEmailAddress?.emailAddress}</p>
        <BookScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
        <BookList />
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({ page: parsePage(search.page) }),
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  component: Home,
});
