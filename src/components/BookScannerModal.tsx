import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useRef, useState } from "react";

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

export const BookScannerModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <button type="button" className="lb-btn lb-btn--outline" onClick={onClose}>
        Close
      </button>
      {open && <ScannerOrBookInfo />}
    </dialog>
  );
};

const ScannerOrBookInfo = () => {
  const [code, setCode] = useState<string>();

  return code ? (
    <BookInfo code={code} />
  ) : (
    <Scanner onScan={(detected) => setCode(detected[0]?.rawValue)} />
  );
};
