import { Link, createFileRoute } from "@tanstack/react-router";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";

import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";

const BookInfo = ({ code }: { code: string }) => {
  const { data: book, isLoading, error } = useGetBookByIsbn(code);

  if (isLoading) return <p>Looking up book...</p>;
  if (error || !book) return <p>No book found for code {code}.</p>;

  return (
    <div>
      <img src={getGetImageUrl(book.isbn)} alt={book.title} width={120} />
      <h3>{book.title}</h3>
      <p>{book.authors.join(", ")}</p>
    </div>
  );
};

const Scan = () => {
  const [code, setCode] = useState<string>();

  return (
    <main>
      <h1 className="sr-only">Scan books</h1>
      <Link to="/" search={{ page: 1, q: "" }} className="lb-btn lb-btn--outline">
        Close
      </Link>
      {code ? (
        <BookInfo code={code} />
      ) : (
        <Scanner onScan={(detected) => setCode(detected[0]?.rawValue)} />
      )}
    </main>
  );
};

export const Route = createFileRoute("/_authed/scan")({ component: Scan });
