import { expect, test } from "vitest";

import { passwordStrength } from "./password";

test.each([
  [0, 0, "At least 8 characters"],
  [7, 1, "Too short: 7 of 8"],
  [8, 2, "Good · 8 characters"],
  [11, 2, "Good · 11 characters"],
  [12, 3, "Strong · 12 characters"],
])("a %i character password", (length, level, text) => {
  expect(passwordStrength("a".repeat(length))).toEqual({ level, text });
});
