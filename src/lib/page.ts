export const parsePage = (value: unknown) => {
  const n = typeof value === "number" || typeof value === "string" ? Math.floor(Number(value)) : 1;
  return Number.isFinite(n) ? Math.max(1, n) : 1;
};

export const pageItems = (page: number, totalPages: number) => {
  const shown = [1, page - 2, page, page + 2, totalPages].filter(
    (n, i, all) => n >= 1 && n <= totalPages && all.indexOf(n) === i,
  );
  const items: (number | "…")[] = [];
  let prev = 0;
  for (const n of shown) {
    if (n - prev > 1) items.push(n - prev === 2 ? n - 1 : "…");
    items.push(n);
    prev = n;
  }
  return items;
};

export const parseQuery = (value: unknown) =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value).trim()
    : "";
