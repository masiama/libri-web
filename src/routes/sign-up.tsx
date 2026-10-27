import { useSignUp } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  AuthBanner,
  AuthFooter,
  AuthShell,
  fieldClass,
  formClass,
  labelClass,
  submitClass,
} from "#/components/AuthShell";
import { CodeStep, useShowCodeStep, type ClerkError } from "#/components/CodeStep";
import { PeekingDino, type PeekMood } from "#/components/Dino";
import { CircleAlert } from "#/components/icons";
import { BarSpinner } from "#/components/Loaders";
import { PasswordMeter } from "#/components/PasswordMeter";
import {
  clerkErrorCode,
  validateRedirectSearch,
  signUpProblem,
  type SignUpProblem,
} from "#/lib/auth";
import { useLeaveWhenSignedIn } from "#/lib/useLeaveWhenSignedIn";

const FieldError = ({ id, problem }: { id: string; problem: SignUpProblem }) => (
  <p
    id={id}
    role="alert"
    className="text-danger-text m-0 flex items-start gap-1.5 text-sm leading-[1.4] font-semibold"
  >
    <CircleAlert size={16} strokeWidth={2.4} aria-hidden className="mt-0.5 shrink-0" />
    <span>
      {problem.text}
      {problem.taken && (
        <>
          {" "}
          <Link to="/sign-in" search={(prev) => prev} className="underline">
            Sign in instead
          </Link>
        </>
      )}
    </span>
  </p>
);

const needsEmailCode = (signUp: ReturnType<typeof useSignUp>["signUp"]) =>
  signUp.status === "missing_requirements" &&
  signUp.unverifiedFields.includes("email_address") &&
  !signUp.missingFields.includes("password");

const SignUpForm = ({ onSendFailed }: { onSendFailed: (error?: ClerkError) => void }) => {
  const { signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<SignUpProblem>();
  const [focused, setFocused] = useState<"email" | "password">();
  const [created, setCreated] = useState(false);

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setPending(true);
    setProblem(undefined);
    onSendFailed(undefined);
    const showProblem = (next: SignUpProblem) => {
      setProblem(next);
      setPending(false);
    };

    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return showProblem(signUpProblem(clerkErrorCode(error)));
    setCreated(true);
    if (needsEmailCode(signUp)) {
      const sent = await signUp.verifications.sendEmailCode();
      onSendFailed(sent.error ?? undefined);
      return;
    }
    if (signUp.status !== "complete") return showProblem(signUpProblem());
    if ((await signUp.finalize()).error) showProblem(signUpProblem());
  };

  const mood: PeekMood = created
    ? "excited"
    : focused === "email"
      ? "reading"
      : focused === "password"
        ? "shy"
        : problem
          ? "confused"
          : "idle";
  const focusProps = (field: "email" | "password") => ({
    onFocus: () => setFocused(field),
    onBlur: () => setFocused(undefined),
  });

  const problemFor = (field: SignUpProblem["field"]) =>
    problem?.field === field ? problem : undefined;
  const formError = problemFor("form");
  const emailError = problemFor("email");
  const passwordError = problemFor("password");
  const ariaFor = (field: "email" | "password", fallbackId?: string) => ({
    "aria-invalid": !!problemFor(field),
    "aria-describedby": problemFor(field) ? `sign-up-${field}-error` : fallbackId,
  });

  return (
    <div className="relative mt-14 lg:static lg:mt-0">
      <PeekingDino
        mood={mood}
        className="pointer-events-none absolute -top-19.5 right-7 w-30 [clip-path:inset(0_0_14px_0)] lg:right-8"
      />
      <form onSubmit={(e) => void onSubmit(e)} className={formClass}>
        {formError && <AuthBanner text={formError.text} />}
        <div className="lb-field">
          <label htmlFor="sign-up-email" className={labelClass}>
            Email
          </label>
          <input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...focusProps("email")}
            {...ariaFor("email")}
            className={fieldClass}
          />
          {emailError && <FieldError id="sign-up-email-error" problem={emailError} />}
        </div>
        <div className="lb-field">
          <label htmlFor="sign-up-password" className={labelClass}>
            Password
          </label>
          <input
            id="sign-up-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setProblem(undefined);
            }}
            {...focusProps("password")}
            {...ariaFor("password", "sign-up-password-hint")}
            className={fieldClass}
          />
          {passwordError ? (
            <FieldError id="sign-up-password-error" problem={passwordError} />
          ) : (
            <PasswordMeter id="sign-up-password-hint" password={password} />
          )}
        </div>
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? (
            <>
              <BarSpinner label="Creating account" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </div>
  );
};

const SignUpPage = () => {
  const { redirect } = Route.useSearch();
  const { signUp } = useSignUp();
  const [sendError, setSendError] = useState<ClerkError>();
  const showCode = useShowCodeStep(needsEmailCode(signUp), signUp.status === "complete");
  if (useLeaveWhenSignedIn(redirect)) return null;

  if (showCode) {
    return (
      <CodeStep
        email={signUp.emailAddress}
        initialError={sendError}
        onVerify={async (code) => {
          const { error } = await signUp.verifications.verifyEmailCode({ code });
          if (error) return { error };
          return signUp.status === "complete" ? signUp.finalize() : { error: {} };
        }}
        onResend={() => signUp.verifications.sendEmailCode()}
        onChangeEmail={() => void signUp.reset()}
      />
    );
  }

  return (
    <AuthShell title="Join Libri" subtitle="Scan a barcode, find the book.">
      <SignUpForm onSendFailed={setSendError} />
      <AuthFooter>
        Already have an account?{" "}
        <Link to="/sign-in" search={(prev) => prev} className="text-primary font-bold underline">
          Sign in
        </Link>
      </AuthFooter>
    </AuthShell>
  );
};

export const Route = createFileRoute("/sign-up")({
  validateSearch: validateRedirectSearch,
  component: SignUpPage,
});
