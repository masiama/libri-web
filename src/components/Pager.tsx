import { Link } from "@tanstack/react-router";
import clsx from "clsx";

import { pageItems } from "#/lib/page";

import { ChevronLeft, ChevronRight } from "./icons";

const ARROW = "lb-btn lb-btn--primary min-h-(--tap) w-(--tap) px-0";

type PagerProps = {
  page: number;
  totalPages?: number;
  totalItems?: number;
  pageSize: number;
  className?: string;
};

const PrevLink = ({ page }: { page: number }) => (
  <Link
    to="/"
    search={{ page: page - 1 }}
    activeOptions={{ exact: true }}
    disabled={page <= 1}
    aria-label="Previous page"
    tabIndex={0}
    className={ARROW}
  >
    <ChevronLeft aria-hidden />
  </Link>
);

const NextLink = ({ page, totalPages }: { page: number; totalPages?: number }) => (
  <Link
    to="/"
    search={{ page: page + 1 }}
    activeOptions={{ exact: true }}
    disabled={totalPages === undefined || page >= totalPages}
    aria-label="Next page"
    tabIndex={0}
    className={ARROW}
  >
    <ChevronRight aria-hidden />
  </Link>
);

export const Pager = ({ page, totalPages, totalItems, pageSize, className }: PagerProps) => (
  <>
    <nav
      aria-label="Pagination"
      className={clsx("lb-pager lb-pager--compact md:hidden", className)}
    >
      <PrevLink page={page} />
      <span className="lb-pager__status">
        Page <span className="font-mono font-semibold">{page}</span> of{" "}
        <span className="font-mono">{totalPages ?? "…"}</span>
      </span>
      <NextLink page={page} totalPages={totalPages} />
    </nav>
    <nav
      aria-label="Pagination"
      className={clsx(
        "flex flex-wrap items-center justify-center gap-4 max-md:hidden lg:justify-between",
        className,
      )}
    >
      {totalItems !== undefined && (
        <p className="lb-muted m-0 text-sm max-lg:hidden">
          Showing{" "}
          <span className="font-mono">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)}
          </span>{" "}
          of {totalItems}
        </p>
      )}
      <div className="lb-pager">
        <PrevLink page={page} />
        {totalPages !== undefined &&
          pageItems(page, totalPages).map((item, i) =>
            item === "…" ? (
              <span key={`gap-${i}`} className="lb-pager__gap" aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                key={item}
                to="/"
                search={{ page: item }}
                activeOptions={{ exact: true }}
                aria-label={`Page ${item}`}
                className="lb-pager__page"
              >
                {item}
              </Link>
            ),
          )}
        <NextLink page={page} totalPages={totalPages} />
      </div>
    </nav>
  </>
);
