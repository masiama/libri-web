import fc from "fast-check";
import { expect, test } from "vitest";

import { coverPaletteIndex, formatAuthors } from "./cover";

const isbn = fc.stringMatching(/^\d{13}$/);

test("palette index stays within the 7 cover palettes", () => {
  fc.assert(
    fc.property(fc.string(), (code) => {
      const n = coverPaletteIndex(code);
      expect(Number.isInteger(n) && n >= 1 && n <= 7).toBe(true);
    }),
  );
});

test("palette index is stable for the same ISBN", () => {
  fc.assert(fc.property(isbn, (code) => coverPaletteIndex(code) === coverPaletteIndex(code)));
});

test("every palette gets used across ISBNs", () => {
  const seen = new Set(fc.sample(isbn, { numRuns: 500, seed: 1 }).map(coverPaletteIndex));
  expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
});

test.each([
  ["9780261102217", 7],
  ["9780060589462", 4],
  ["9785171183015", 1],
])("%s keeps palette %i", (code, expected) => {
  expect(coverPaletteIndex(code)).toBe(expected);
});

test.each([
  [[], ""],
  [["Frank Herbert"], "Frank Herbert"],
  [["Terry Pratchett", "Neil Gaiman"], "Terry Pratchett, Neil Gaiman"],
  [["Ilf", "Petrov", "Kataev"], "Ilf, Petrov +1"],
  [["A", "B", "C", "D", "E"], "A, B +3"],
])("formatAuthors(%j) is %j", (authors, expected) => {
  expect(formatAuthors(authors)).toBe(expected);
});
