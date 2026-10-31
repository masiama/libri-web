import { expect, test, vi } from "vitest";

import {
  clerkErrorCode,
  codeProblem,
  formatCountdown,
  resetEmailProblem,
  safeRedirect,
  signInProblem,
  signUpProblem,
  validateRedirectSearch,
} from "./auth";

vi.mock("@clerk/react/errors", () => ({
  isClerkAPIResponseError: (error: { fromClerk?: boolean }) => error.fromClerk === true,
}));

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
  [["/books/1"], "/"],
  ["/sign-in?redirect=%2F", "/"],
  ["/sign-up", "/"],
  ["/sign-up?x=1", "/"],
  ["/sign-upward", "/sign-upward"],
  ["/books/sign-in", "/books/sign-in"],
])("safeRedirect(%j) is %j", (input, expected) => {
  expect(safeRedirect(input)).toBe(expected);
});

const TOO_MANY = "Too many attempts. Please wait a few minutes before trying again.";
const WRONG = "Something went wrong. Please try again.";

test.each([
  [
    "form_password_incorrect",
    {
      text: "That email and password don’t match. Try again or reset your password.",
      kind: "mismatch",
      link: "reset your password",
    },
  ],
  [
    "form_identifier_not_found",
    {
      text: "That email and password don’t match. Try again or reset your password.",
      kind: "mismatch",
      link: "reset your password",
    },
  ],
  ["too_many_requests", { text: TOO_MANY, kind: "limited" }],
  [
    "needs_second_factor",
    { text: "Additional verification is required for this account.", kind: "other" },
  ],
  ["something_else", { text: WRONG, kind: "other" }],
  [undefined, { text: WRONG, kind: "other" }],
])("signInProblem(%j)", (code, expected) => {
  expect(signInProblem(code)).toEqual(expected);
});

test.each([
  [
    "form_identifier_exists",
    {
      text: "An account with this email already exists. Sign in instead",
      field: "email",
      link: "Sign in instead",
    },
  ],
  ["form_param_format_invalid", { text: "Enter a valid email address.", field: "email" }],
  [
    "form_password_pwned",
    {
      text: "This password has shown up in a data breach. Pick something only you would use.",
      field: "password",
    },
  ],
  ["form_password_length_too_short", { text: "Use at least 8 characters.", field: "password" }],
  ["too_many_requests", { text: TOO_MANY, field: "form" }],
  ["something_else", { text: WRONG, field: "form" }],
  [undefined, { text: WRONG, field: "form" }],
])("signUpProblem(%j)", (code, expected) => {
  expect(signUpProblem(code)).toEqual(expected);
});

test.each([
  [
    "form_identifier_not_found",
    {
      text: "We couldn’t find an account with that email. Check the address or create an account.",
      kind: "notfound",
      link: "create an account",
    },
  ],
  ["too_many_requests", { text: TOO_MANY, kind: "limited" }],
  ["something_else", { text: WRONG, kind: "other" }],
  [undefined, { text: WRONG, kind: "other" }],
])("resetEmailProblem(%j)", (code, expected) => {
  expect(resetEmailProblem(code)).toEqual(expected);
});

test.each([
  [
    "form_code_incorrect",
    { text: "That code isn’t right. Check the email and try again.", kind: "wrong" },
  ],
  [
    "verification_expired",
    {
      text: "This code has expired. We can send you a fresh one.",
      kind: "expired",
      hint: "Codes only work for a few minutes.",
    },
  ],
  [
    "verification_failed",
    { text: "Too many wrong tries. We can send you a fresh code.", kind: "expired" },
  ],
  ["verification_code_rate_limit_exceeded", { text: TOO_MANY, kind: "limited" }],
  ["verification_code_too_many_requests", { text: TOO_MANY, kind: "limited" }],
  ["too_many_requests", { text: TOO_MANY, kind: "limited" }],
  ["something_else", { text: WRONG, kind: "other" }],
  [undefined, { text: WRONG, kind: "other" }],
])("codeProblem(%j)", (code, expected) => {
  expect(codeProblem(code)).toEqual(expected);
});

test("the messages that carry a link contain the words that link", () => {
  for (const { text, link } of [
    signInProblem("form_password_incorrect"),
    resetEmailProblem("form_identifier_not_found"),
    signUpProblem("form_identifier_exists"),
  ]) {
    expect(link && text.includes(link)).toBe(true);
  }
});

test("the redirect search keeps a string and drops anything else", () => {
  expect(validateRedirectSearch({ redirect: "/books/1" })).toEqual({ redirect: "/books/1" });
  expect(validateRedirectSearch({ redirect: "" })).toEqual({ redirect: "" });
  expect(validateRedirectSearch({ redirect: 5 })).toEqual({});
  expect(validateRedirectSearch({ redirect: undefined })).toEqual({});
  expect(validateRedirectSearch({})).toEqual({});
});

const apiError = (code: string, errors: { code?: string }[]) =>
  ({ fromClerk: true, code, errors }) as unknown as { code?: string };

test("a Clerk API error gives its first error's code", () => {
  expect(clerkErrorCode(apiError("outer", [{ code: "inner" }, { code: "second" }]))).toBe("inner");
});

test("a Clerk API error without errors falls back to its own code", () => {
  expect(clerkErrorCode(apiError("outer", []))).toBe("outer");
  expect(clerkErrorCode(apiError("outer", [{}]))).toBe("outer");
});

test("any other error gives its code", () => {
  expect(clerkErrorCode({ code: "plain" })).toBe("plain");
  expect(clerkErrorCode({})).toBeUndefined();
});

test.each([
  [42, "0:42"],
  [60, "1:00"],
  [5, "0:05"],
  [0, "0:00"],
])("formatCountdown(%j) is %j", (seconds, text) => {
  expect(formatCountdown(seconds)).toBe(text);
});
