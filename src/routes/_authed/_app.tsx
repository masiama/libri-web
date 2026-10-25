import { Link, Outlet, createFileRoute } from "@tanstack/react-router";

import { AccountMenu } from "#/components/AccountMenu";
import { ScanIcon } from "#/components/icons";
import { Logo } from "#/components/Logo";
import { SearchField } from "#/components/SearchField";

const AppLayout = () => (
  <>
    <header className="lb-header lg:px-column">
      <Link
        to="/"
        search={{ page: 1, q: "" }}
        aria-label="Libri library"
        className="text-ink flex items-center gap-2.5"
      >
        <Logo className="size-7 md:size-8" />
        <span className="lb-wordmark md:text-[1.25rem]">libri</span>
      </Link>
      <SearchField shortcut className="mx-auto max-w-140 flex-1 max-md:hidden" />
      <Link
        to="/scan"
        className="lb-btn lb-btn--frog min-h-11 pr-4 pl-3 text-[0.9375rem] max-md:ml-auto md:min-h-12 md:pr-5 md:pl-4"
      >
        <ScanIcon size={20} className="md:size-5.5" />
        <span className="lg:hidden">Scan</span>
        <span className="max-lg:hidden">Scan books</span>
      </Link>
      <AccountMenu />
    </header>
    <Outlet />
  </>
);

export const Route = createFileRoute("/_authed/_app")({ component: AppLayout });
