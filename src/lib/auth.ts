export const safeRedirect = (value: unknown) =>
  typeof value === "string" && /^\/(?![/\\])/.test(value) && !value.startsWith("/sign-in")
    ? value
    : "/";

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
      return {
        text: "Too many attempts. Please wait a few minutes before trying again.",
        kind: "limited",
      };
    case "needs_second_factor":
      return { text: "Additional verification is required for this account.", kind: "other" };
    default:
      return { text: "Something went wrong. Please try again.", kind: "other" };
  }
};
