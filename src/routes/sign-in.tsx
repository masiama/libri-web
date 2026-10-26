import { useSignIn } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";

import {
  AuthFooter,
  AuthShell,
  fieldClass,
  formClass,
  labelClass,
  submitClass,
} from "#/components/AuthShell";
import { CircleAlert } from "#/components/icons";
import { BarSpinner } from "#/components/Loaders";
import { clerkErrorCode, validateRedirectSearch, signInProblem, type SignInProblem } from "#/lib/auth";
import { useLeaveWhenSignedIn } from "#/lib/useLeaveWhenSignedIn";

const SignInForm = () => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<SignInProblem>();
  const clearLimit = () => setProblem((p) => (p?.kind === "limited" ? undefined : p));

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (problem?.kind === "limited") return;
    setPending(true);
    setProblem(undefined);
    const showProblem = (next: SignInProblem) => {
      setProblem(next);
      setPending(false);
    };

    const { error } = await signIn.password({ identifier: email, password });
    if (error) {
      return showProblem(signInProblem(clerkErrorCode(error)));
    }
    if (signIn.status !== "complete") return showProblem(signInProblem("needs_second_factor"));
    const finalized = await signIn.finalize();
    if (finalized.error) showProblem(signInProblem());
  };

  const invalid = problem?.kind === "mismatch";
  const invalidProps = {
    "aria-invalid": invalid,
    "aria-describedby": invalid ? "sign-in-problem" : undefined,
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={formClass}>
      {problem && (
        <div
          id="sign-in-problem"
          role="alert"
          className={clsx(
            "flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm leading-[1.4] font-semibold",
            problem.kind === "limited"
              ? "bg-warn-soft text-warn-text"
              : "bg-danger-soft text-danger-text",
          )}
        >
          <CircleAlert size={20} strokeWidth={2.4} aria-hidden className="mt-px shrink-0" />
          <span>{problem.text}</span>
        </div>
      )}
      <div className="lb-field">
        <label htmlFor="sign-in-email" className={labelClass}>
          Email
        </label>
        <input
          id="sign-in-email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearLimit();
          }}
          {...invalidProps}
          className={fieldClass}
        />
      </div>
      <div className="lb-field">
        <label htmlFor="sign-in-password" className={labelClass}>
          Password
        </label>
        <input
          id="sign-in-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearLimit();
          }}
          {...invalidProps}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        aria-disabled={problem?.kind === "limited"}
        className={submitClass}
      >
        {pending ? (
          <>
            <BarSpinner label="Signing in" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
};

const SignInPage = () => {
  const { redirect } = Route.useSearch();
  if (useLeaveWhenSignedIn(redirect)) return null;

  return (
    <AuthShell title="Welcome back" subtitle="Good to see you again.">
      <SignInForm />
      <AuthFooter>
        New to Libri?{" "}
        <Link to="/sign-up" search={(prev) => prev} className="text-primary font-bold underline">
          Create an account
        </Link>
      </AuthFooter>
    </AuthShell>
  );
};

export const Route = createFileRoute("/sign-in")({
  validateSearch: validateRedirectSearch,
  component: SignInPage,
});
