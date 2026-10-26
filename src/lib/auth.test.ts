import { expect, test } from "vitest";

import { safeRedirect, signInProblem, signUpProblem } from "./auth";

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
  ["/sign-up", "/"],
  ["/sign-up?x=1", "/"],
  ["/sign-upward", "/sign-upward"],
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

test.each([
  ["form_identifier_exists", "email", true],
  ["form_param_format_invalid", "email", undefined],
  ["form_password_pwned", "password", undefined],
  ["form_password_length_too_short", "password", undefined],
  ["too_many_requests", "form", undefined],
  [undefined, "form", undefined],
])("signUpProblem(%j) is on the %s field, taken: %j", (code, field, taken) => {
  const problem = signUpProblem(code);
  expect(problem.field).toBe(field);
  expect(problem.taken).toBe(taken);
});
