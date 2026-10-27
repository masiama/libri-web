import { isClerkAPIResponseError } from "@clerk/react/errors";

const TOO_MANY = "Too many attempts. Please wait a few minutes before trying again.";

export const safeRedirect = (value: unknown) =>
  typeof value === "string" && /^\/(?![/\\])/.test(value) && !/^\/sign-(in|up)(?![\w-])/.test(value)
    ? value
    : "/";

export const clerkErrorCode = (error: { code?: string }) =>
  isClerkAPIResponseError(error) ? (error.errors[0]?.code ?? error.code) : error.code;

export const validateRedirectSearch = (search: Record<string, unknown>) =>
  typeof search.redirect === "string" ? { redirect: search.redirect } : {};

export type SignInProblem = { text: string; kind: "mismatch" | "limited" | "other" };

export const signInProblem = (code?: string): SignInProblem => {
  switch (code) {
    case "form_password_incorrect":
    case "form_identifier_not_found":
      return {
        text: "That email and password don’t match. Try again or reset your password.",
        kind: "mismatch",
      };
    case "too_many_requests":
      return { text: TOO_MANY, kind: "limited" };
    case "needs_second_factor":
      return { text: "Additional verification is required for this account.", kind: "other" };
    default:
      return { text: "Something went wrong. Please try again.", kind: "other" };
  }
};

export type SignUpProblem = { text: string; field: "email" | "password" | "form"; taken?: boolean };

export const signUpProblem = (code?: string): SignUpProblem => {
  switch (code) {
    case "form_identifier_exists":
      return { text: "An account with this email already exists.", field: "email", taken: true };
    case "form_param_format_invalid":
      return { text: "Enter a valid email address.", field: "email" };
    case "form_password_pwned":
      return {
        text: "This password has shown up in a data breach. Pick something only you would use.",
        field: "password",
      };
    case "form_password_length_too_short":
      return { text: "Use at least 8 characters.", field: "password" };
    case "too_many_requests":
      return { text: TOO_MANY, field: "form" };
    default:
      return { text: "Something went wrong. Please try again.", field: "form" };
  }
};

export type CodeProblem = { text: string; kind: "wrong" | "expired" | "limited" | "other" };

export const codeProblem = (code?: string): CodeProblem => {
  switch (code) {
    case "form_code_incorrect":
      return { text: "That code isn’t right. Check the email and try again.", kind: "wrong" };
    case "verification_expired":
      return { text: "This code has expired. We can send you a fresh one.", kind: "expired" };
    case "verification_failed":
      return { text: "Too many wrong tries. We can send you a fresh code.", kind: "expired" };
    case "verification_code_rate_limit_exceeded":
    case "verification_code_too_many_requests":
    case "too_many_requests":
      return { text: TOO_MANY, kind: "limited" };
    default:
      return { text: "Something went wrong. Please try again.", kind: "other" };
  }
};

export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
