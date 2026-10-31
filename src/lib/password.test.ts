import { expect, test } from "vitest";

import { passwordStrength } from "./password";

test.each([
  [0, 0, "At least 8 characters", ""],
  [7, 1, "Too short: 7 of 8", "Too short"],
  [8, 2, "Good · 8 characters", "Good"],
  [11, 2, "Good · 11 characters", "Good"],
  [12, 3, "Strong · 12 characters", "Strong"],
])("a %i character password", (length, level, text, label) => {
  expect(passwordStrength("a".repeat(length))).toEqual({ level, text, label });
});
