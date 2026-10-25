import { useUser } from "@clerk/react";
import { Link, Navigate, createFileRoute, stripSearchParams } from "@tanstack/react-router";

import { Cover } from "#/components/Cover";
import { CoverSkeleton } from "#/components/Loaders";
import { Pager } from "#/components/Pager";
import { getGetImageUrl, useListBooks } from "#/generated/api/endpoints";
import { formatAuthors } from "#/lib/cover";
import { parsePage } from "#/lib/page";

const PAGE_SIZE = 20;

const BookList = () => {
  const { page } = Route.useSearch();
  const { data, isLoading } = useListBooks({ page: page - 1, size: PAGE_SIZE });
  const pageMeta = data?.page;
  const lastPage = pageMeta && Math.max(1, pageMeta.totalPages ?? 1);

  if (lastPage && page > lastPage) return <Navigate to="/" search={{ page: lastPage }} replace />;

  return (
    <>
      <div className="flex items-center gap-2.5 md:gap-3">
        <h1 className="lb-title md:text-[1.875rem] lg:text-[2rem]">Library</h1>
        {pageMeta && <span className="lb-chip">{pageMeta.totalElements} books</span>}
      </div>
      <div className="lb-grid" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }, (_, i) => <CoverSkeleton key={i} />)
          : data?.content?.map((book) => (
              <Link
                key={book.isbn}
                to="/books/$isbn"
                params={{ isbn: book.isbn }}
                state={{ libraryPage: page }}
                className="lb-book"
              >
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
              </Link>
            ))}
      </div>
      <Pager
        page={page}
        totalPages={lastPage}
        totalItems={pageMeta?.totalElements}
        pageSize={PAGE_SIZE}
      />
    </>
  );
};

const Library = () => {
  const { user } = useUser();

  return (
    <main className="lg:px-column flex flex-col gap-4 px-5 pt-5 pb-8 md:gap-6 md:px-8 md:pt-7 lg:pt-8 lg:pb-16">
      <p>{user?.primaryEmailAddress?.emailAddress}</p>
      <BookList />
    </main>
  );
};

export const Route = createFileRoute("/_authed/")({
  validateSearch: (search: Record<string, unknown>) => ({ page: parsePage(search.page) }),
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  component: Library,
});
