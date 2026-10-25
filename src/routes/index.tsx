import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BookScannerModal } from "#/components/BookScannerModal";
import { ScanIcon } from "#/components/icons";
import { Logo } from "#/components/Logo";
import { useListBooks } from "#/generated/api/endpoints";

const PAGE_SIZE = 10;

const BookList = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useListBooks({ page, size: PAGE_SIZE });
  const pageMeta = data?.page;

  return (
    <div>
      <h2>Books</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {data?.content?.map((book) => (
            <li key={book.isbn}>
              {book.title} — {book.authors?.join(", ")}
            </li>
          ))}
        </ul>
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
    </div>
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
      <header className="lb-header lg:px-[max(32px,calc((100%-1280px)/2+32px))]">
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
      <main className="p-8">
        <p>{user.primaryEmailAddress?.emailAddress}</p>
        <BookScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
        <BookList />
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({ component: Home });
