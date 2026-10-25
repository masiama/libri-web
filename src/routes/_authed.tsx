import { SignInButton, SignOutButton, useUser } from "@clerk/react";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BookScannerModal } from "#/components/BookScannerModal";
import { ScanIcon } from "#/components/icons";
import { Logo } from "#/components/Logo";

const AuthedLayout = () => {
  const { isLoaded, isSignedIn } = useUser();
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
        <Link
          to="/"
          search={{ page: 1 }}
          aria-label="Libri library"
          className="text-ink flex items-center gap-2.5"
        >
          <Logo className="size-7 md:size-8" />
          <span className="lb-wordmark md:text-[1.25rem]">libri</span>
        </Link>
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
      <BookScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
      <Outlet />
    </>
  );
};

export const Route = createFileRoute("/_authed")({ component: AuthedLayout });
