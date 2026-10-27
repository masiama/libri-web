import { expect, test } from "vitest";

import { EMPTY_DIGITS as empty, fillDigits } from "./otp";

test.each([
  ["six digits into box 3 fill every box", empty, "123456", 3, "123456", 5],
  ["six digits with spaces fill every box", empty, "123 456", 0, "123456", 5],
  ["a short paste fills from the focused box", empty, "12", 2, "  12  ", 4],
  ["a paste past the end is cut off", empty, "12345", 4, "    12", 5],
  ["non-digits are ignored", ["1", "", "", "", "", ""], "a2b3", 1, "123   ", 3],
])("%s", (_, digits, raw, at, filled, focus) => {
  const result = fillDigits(digits, raw, at);
  expect(result.next.map((d) => d || " ").join("")).toBe(filled);
  expect(result.focus).toBe(focus);
  expect(result.changed).toBe(true);
});

test("a paste with no digits changes nothing", () => {
  expect(fillDigits(empty, "abc", 0).changed).toBe(false);
});
