import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BookScannerModal } from "#/components/BookScannerModal";
import { Cover } from "#/components/Cover";
import { ScanIcon } from "#/components/icons";
import { Logo } from "#/components/Logo";
import { getGetImageUrl, useListBooks } from "#/generated/api/endpoints";
import { formatAuthors } from "#/lib/cover";

const PAGE_SIZE = 10;

const BookList = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useListBooks({ page, size: PAGE_SIZE });
  const pageMeta = data?.page;

  return (
    <>
      <div className="flex items-center gap-2.5 md:gap-3">
        <h1 className="lb-title md:text-[1.875rem] lg:text-[2rem]">Library</h1>
        {pageMeta && <span className="lb-chip">{pageMeta.totalElements} books</span>}
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="lb-grid">
          {data?.content?.map((book) => (
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
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lb-btn lb-btn--soft"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span>
          Page {page + 1} of {pageMeta?.totalPages ?? 1}
        </span>
        <button
          type="button"
          className="lb-btn lb-btn--soft"
          disabled={pageMeta === undefined || page + 1 >= pageMeta.totalPages!}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
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

export const Route = createFileRoute("/")({ component: Home });
