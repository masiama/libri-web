import { expect, test } from "vitest";

import { safeRedirect, signInProblem } from "./auth";

test.each([
  ["/books/9780156012195", "/books/9780156012195"],
  ["/?page=2&q=dune", "/?page=2&q=dune"],
  ["/scan#top", "/scan#top"],
  ["//evil.example", "/"],
  ["/\\evil.example", "/"],
  ["https://evil.example", "/"],
  ["javascript:alert(1)", "/"],
  ["books", "/"],
  ["", "/"],
  [undefined, "/"],
  [42, "/"],
  ["/sign-in?redirect=%2F", "/"],
])("safeRedirect(%j) is %j", (input, expected) => {
  expect(safeRedirect(input)).toBe(expected);
});

test.each([
  ["form_password_incorrect", "mismatch"],
  ["form_identifier_not_found", "mismatch"],
  ["too_many_requests", "limited"],
  ["something_else", "other"],
  [undefined, "other"],
])("signInProblem(%j) is a %s problem", (code, kind) => {
  expect(signInProblem(code).kind).toBe(kind);
});
