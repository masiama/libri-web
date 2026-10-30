import { expect, test } from "vitest";

import {
  codeProblem,
  formatCountdown,
  resetEmailProblem,
  safeRedirect,
  signInProblem,
  signUpProblem,
} from "./auth";

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
  ["form_identifier_exists", "email", "Sign in instead"],
  ["form_param_format_invalid", "email", undefined],
  ["form_password_pwned", "password", undefined],
  ["form_password_length_too_short", "password", undefined],
  ["too_many_requests", "form", undefined],
  [undefined, "form", undefined],
])("signUpProblem(%j) is on the %s field, link: %j", (code, field, link) => {
  const problem = signUpProblem(code);
  expect(problem.field).toBe(field);
  expect(problem.link).toBe(link);
  if (link) expect(problem.text).toContain(link);
});

test.each([
  ["form_identifier_not_found", "notfound"],
  ["too_many_requests", "limited"],
  ["something_else", "other"],
  [undefined, "other"],
])("resetEmailProblem(%j) is a %s problem", (code, kind) => {
  expect(resetEmailProblem(code).kind).toBe(kind);
});

test.each([
  ["form_code_incorrect", "wrong"],
  ["verification_expired", "expired"],
  ["verification_failed", "expired"],
  ["verification_code_rate_limit_exceeded", "limited"],
  ["verification_code_too_many_requests", "limited"],
  ["too_many_requests", "limited"],
  ["something_else", "other"],
  [undefined, "other"],
])("codeProblem(%j) is a %s problem", (code, kind) => {
  expect(codeProblem(code).kind).toBe(kind);
});

test("only a plain expiry explains how long codes last", () => {
  expect(codeProblem("verification_expired").hint).toBe("Codes only work for a few minutes.");
  expect(codeProblem("verification_failed").hint).toBeUndefined();
});

test("the reset email message contains the words that link to sign up", () => {
  const { text, link } = resetEmailProblem("form_identifier_not_found");
  expect(link && text.includes(link)).toBe(true);
});

test("the sign-in mismatch message contains the words that link to the reset page", () => {
  const { text, link } = signInProblem("form_password_incorrect");
  expect(link && text.includes(link)).toBe(true);
  expect(signInProblem("too_many_requests").link).toBeUndefined();
});

test.each([
  [42, "0:42"],
  [60, "1:00"],
  [5, "0:05"],
  [0, "0:00"],
])("formatCountdown(%j) is %j", (seconds, text) => {
  expect(formatCountdown(seconds)).toBe(text);
});
