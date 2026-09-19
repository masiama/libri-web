import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
      <div>
        <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page + 1} of {pageMeta?.totalPages ?? 1}
        </span>
        <button
          type="button"
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

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <SignInButton mode="modal">
          <button type="button">Sign in</button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="p-8">
      <p>{user.primaryEmailAddress?.emailAddress}</p>
      <SignOutButton>
        <button type="button">Sign out</button>
      </SignOutButton>
      <BookList />
    </div>
  );
};

export const Route = createFileRoute("/")({ component: Home });
