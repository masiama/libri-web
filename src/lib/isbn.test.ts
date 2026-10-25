import fc from "fast-check";
import { expect, test } from "vitest";

import { formatIsbn } from "./isbn";

test.each([
  ["9780141036144", "978 0 14 103614 4"],
  ["9780060589462", "978 0 06 058946 2"],
  ["9780261102217", "978 0 261 10221 7"],
  ["9791032305560", "979 10 323 0556 0"],
])("groups %s as %s", (code, grouped) => {
  expect(formatIsbn(code)).toBe(grouped);
});

test.each([
  ["bad check digit", "9780141036145"],
  ["store barcode", "4006381333931"],
  ["too short", "978014103614"],
  ["not digits", "abc"],
])("leaves a %s as it is", (_, code) => {
  expect(formatIsbn(code)).toBe(code);
});

test("only ever adds spaces", () => {
  fc.assert(
    fc.property(fc.stringMatching(/^\d{13}$/), (code) => {
      expect(formatIsbn(code).replaceAll(" ", "")).toBe(code);
    }),
  );
});

const englishIsbn = fc.stringMatching(/^9780\d{8}$/).map((first12) => {
  const sum = first12.split("").reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return first12 + ((10 - (sum % 10)) % 10);
});

test("splits any valid English-group ISBN into five groups", () => {
  fc.assert(
    fc.property(englishIsbn, (code) => {
      const groups = formatIsbn(code).split(" ");
      expect(groups).toHaveLength(5);
      expect(groups.slice(0, 2)).toEqual(["978", "0"]);
      expect(groups.join("")).toBe(code);
    }),
  );
});
