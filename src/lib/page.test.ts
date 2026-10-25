import fc from "fast-check";
import { expect, test } from "vitest";

import { pageItems, parsePage } from "./page";

test.each([
  [undefined, 1],
  ["", 1],
  ["abc", 1],
  [null, 1],
  [{ toString: 0 }, 1],
  [[5], 1],
  [0, 1],
  [-3, 1],
  [Number.NaN, 1],
  [Number.POSITIVE_INFINITY, 1],
  [1, 1],
  [2, 2],
  ["7", 7],
  [3.9, 3],
])("parsePage(%o) is %i", (value, expected) => {
  expect(parsePage(value)).toBe(expected);
});

test("any page from 1 up survives unchanged", () => {
  fc.assert(fc.property(fc.integer({ min: 1, max: 1e9 }), (n) => parsePage(n) === n));
});

test("result is always a whole number of at least 1", () => {
  fc.assert(
    fc.property(fc.anything(), (value) => {
      const n = parsePage(value);
      expect(Number.isInteger(n) && n >= 1).toBe(true);
    }),
  );
});

test.each([
  [2, 50, [1, 2, 3, 4, "…", 50]],
  [3, 50, [1, 2, 3, 4, 5, "…", 50]],
  [5, 50, [1, 2, 3, 4, 5, 6, 7, "…", 50]],
  [25, 50, [1, "…", 23, 24, 25, 26, 27, "…", 50]],
  [46, 50, [1, "…", 44, 45, 46, 47, 48, 49, 50]],
  [1, 1, [1]],
  [1, 3, [1, 2, 3]],
])("pageItems(%i, %i) is %o", (page, total, expected) => {
  expect(pageItems(page, total)).toEqual(expected);
});

test("pager keeps first, last and current page in order, gaps hide 2+ pages", () => {
  fc.assert(
    fc.property(
      fc
        .integer({ min: 1, max: 1e6 })
        .chain((total) => fc.tuple(fc.integer({ min: 1, max: total }), fc.constant(total))),
      ([page, total]) => {
        const items = pageItems(page, total);
        const numbers = items.filter((x) => x !== "…");
        expect(items[0]).toBe(1);
        expect(items.at(-1)).toBe(total);
        expect(numbers).toContain(page);
        expect(items.length).toBeLessThanOrEqual(9);
        items.forEach((x, i) => {
          if (x !== "…") return;
          const before = items[i - 1] as number;
          const after = items[i + 1] as number;
          expect(after - before).toBeGreaterThan(2);
        });
        numbers.forEach((n, i) => i > 0 && expect(n).toBeGreaterThan(numbers[i - 1]));
      },
    ),
  );
});
