import { Link } from "@tanstack/react-router";
import clsx from "clsx";

import { pageItems } from "#/lib/page";

import { ChevronLeft, ChevronRight } from "./icons";

type PagerProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
  className?: string;
};

type StepLinkProps = { page: number; totalPages: number; step: -1 | 1; loading: boolean };

const StepLink = ({ page, totalPages, step, loading }: StepLinkProps) => {
  const to = page + step;
  return (
    <Link
      from="/"
      to="/"
      search={(prev) => ({ ...prev, page: to })}
      activeOptions={{ exact: true }}
      disabled={loading || to < 1 || to > totalPages}
      aria-label={step < 0 ? "Previous page" : "Next page"}
      tabIndex={0}
      className="lb-btn lb-btn--primary min-h-(--tap) w-(--tap) px-0"
    >
      {step < 0 ? <ChevronLeft aria-hidden /> : <ChevronRight aria-hidden />}
    </Link>
  );
};

export const Pager = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  loading,
  className,
}: PagerProps) => (
  <>
    <nav
      aria-label="Pagination"
      className={clsx("lb-pager lb-pager--compact md:hidden", className)}
    >
      <StepLink page={page} totalPages={totalPages} step={-1} loading={loading} />
      <span className="lb-pager__status">
        Page <span className="font-mono font-semibold">{page}</span> of{" "}
        <span className="font-mono">{loading ? "…" : totalPages}</span>
      </span>
      <StepLink page={page} totalPages={totalPages} step={1} loading={loading} />
    </nav>
    <nav
      aria-label="Pagination"
      className={clsx(
        "flex flex-wrap items-center justify-center gap-4 max-md:hidden lg:justify-between",
        className,
      )}
    >
      <p className="lb-muted m-0 text-sm max-lg:hidden">
        Showing{" "}
        <span className="font-mono">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of {totalItems}
      </p>
      <div className="lb-pager">
        <StepLink page={page} totalPages={totalPages} step={-1} loading={loading} />
        {pageItems(page, totalPages).map((item, i) =>
          item === "…" ? (
            <span key={`gap-${i}`} className="lb-pager__gap" aria-hidden="true">
              …
            </span>
          ) : (
            <Link
              key={item}
              from="/"
              to="/"
              search={(prev) => ({ ...prev, page: item })}
              activeOptions={{ exact: true }}
              aria-label={`Page ${item}`}
              className="lb-pager__page"
            >
              {item}
            </Link>
          ),
        )}
        <StepLink page={page} totalPages={totalPages} step={1} loading={loading} />
      </div>
    </nav>
  </>
);
