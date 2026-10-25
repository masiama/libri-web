import { Link, createFileRoute } from "@tanstack/react-router";
import { Scanner } from "@yudiel/react-qr-scanner";
import clsx from "clsx";
import { useState } from "react";

import { X } from "#/components/icons";
import { getGetImageUrl, useGetBookByIsbn } from "#/generated/api/endpoints";
import { useBackClick } from "#/lib/back";

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

const CloseLink = () => {
  const onBack = useBackClick();

  return (
    <Link
      to="/"
      search={{ page: 1, q: "" }}
      aria-label="Close scanner"
      className="lb-btn lb-btn--icon bg-(--scan-row)"
      onClick={onBack}
    >
      <X size={18} strokeWidth={2.5} aria-hidden />
    </Link>
  );
};

const HINT = "text-muted absolute inset-x-0 text-center text-[0.8125rem] md:text-[0.9375rem]";

const Scan = () => {
  const [code, setCode] = useState<string>();

  return (
    <main className="lb-scan flex flex-col pt-4 md:pt-0 lg:h-dvh">
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-(--scan-row) px-3 md:h-18 md:gap-3.5 md:px-7 lg:h-19 lg:gap-4 lg:px-10">
        <CloseLink />
        <h1 className="font-display text-[0.9375rem] font-semibold md:text-[1.1875rem] lg:text-xl">
          Keep scanning
        </h1>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pt-3 md:gap-5 md:px-7 md:pt-5 md:pb-7 lg:flex-row lg:gap-8 lg:px-10 lg:py-8">
        <div className="lb-camera mx-3 h-95 shrink-0 md:mx-0 md:h-150 lg:h-auto lg:min-w-0 lg:flex-1">
          <Scanner
            onScan={(detected) => setCode(detected[0]?.rawValue)}
            components={{ finder: false }}
            styles={{ container: { position: "absolute", inset: 0, aspectRatio: "auto" } }}
          />
          <div aria-hidden className="lb-reticle max-md:top-[40%] lg:w-90">
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__corner" />
            <span className="lb-reticle__laser" />
          </div>
          <p className={clsx(HINT, "top-4 md:hidden")}>Point at the barcode on the back</p>
          <p className={clsx(HINT, "top-5 max-md:hidden lg:hidden")}>
            Hold the back cover inside the frame
          </p>
          <p className={clsx(HINT, "top-[70%] max-lg:hidden")}>
            Hold the back cover up to your webcam
          </p>
        </div>
        <aside className="mx-3 md:mx-0 lg:w-95 lg:shrink-0 xl:w-110">
          <output className="block">{code && <BookInfo code={code} />}</output>
        </aside>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/_authed/scan")({ component: Scan });
