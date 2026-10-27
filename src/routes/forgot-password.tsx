import { useSignIn } from "@clerk/react";
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
import { CodeStep, type ClerkError } from "#/components/CodeStep";
import { BarSpinner } from "#/components/Loaders";
import { PasswordMeter } from "#/components/PasswordMeter";
import {
  clerkErrorCode,
  resetEmailProblem,
  signUpProblem,
  validateRedirectSearch,
  type SignInProblem,
  type SignUpProblem,
} from "#/lib/auth";
import { useLeaveWhenSignedIn } from "#/lib/useLeaveWhenSignedIn";

const EmailForm = ({ onSendFailed }: { onSendFailed: (error?: ClerkError) => void }) => {
  const { signIn } = useSignIn();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<SignInProblem>();

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setPending(true);
    setProblem(undefined);
    onSendFailed(undefined);
    const { error } = await signIn.create({ identifier: email });
    if (error) {
      setProblem(resetEmailProblem(clerkErrorCode(error)));
      return setPending(false);
    }
    onSendFailed((await signIn.resetPasswordEmailCode.sendCode()).error ?? undefined);
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={formClass}>
      {problem && <AuthBanner text={problem.text} warn={problem.kind === "limited"} />}
      <div className="lb-field">
        <label htmlFor="forgot-email" className={labelClass}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
      </div>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? (
          <>
            <BarSpinner label="Sending code" />
            Sending code…
          </>
        ) : (
          "Send code"
        )}
      </button>
    </form>
  );
};

const NewPasswordForm = () => {
  const { signIn } = useSignIn();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState<SignUpProblem>();

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setPending(true);
    setProblem(undefined);
    const showProblem = (next: SignUpProblem) => {
      setProblem(next);
      setPending(false);
    };
    const saved = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (saved.error) return showProblem(signUpProblem(clerkErrorCode(saved.error)));
    if ((await signIn.finalize()).error) showProblem(signUpProblem());
  };

  return (
    <form onSubmit={(e) => void onSubmit(e)} className={formClass}>
      {problem && <AuthBanner text={problem.text} />}
      <div className="lb-field">
        <label htmlFor="forgot-password" className={labelClass}>
          New password
        </label>
        <input
          id="forgot-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="forgot-password-hint"
          className={fieldClass}
        />
        <PasswordMeter id="forgot-password-hint" password={password} />
      </div>
      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? (
          <>
            <BarSpinner label="Saving password" />
            Saving…
          </>
        ) : (
          "Save password"
        )}
      </button>
    </form>
  );
};

const ForgotPasswordPage = () => {
  const { redirect } = Route.useSearch();
  const { signIn } = useSignIn();
  const [sendError, setSendError] = useState<ClerkError>();
  if (useLeaveWhenSignedIn(redirect)) return null;

  if (signIn.status === "needs_first_factor") {
    return (
      <CodeStep
        email={signIn.identifier}
        initialError={sendError}
        onVerify={(code) => signIn.resetPasswordEmailCode.verifyCode({ code })}
        onResend={() => signIn.resetPasswordEmailCode.sendCode()}
        onChangeEmail={() => void signIn.reset()}
      />
    );
  }

  const choosing = signIn.status === "needs_new_password";
  return (
    <AuthShell
      title={choosing ? "Choose a new password" : "Reset your password"}
      subtitle={
        choosing
          ? "Pick something only you would use."
          : "Enter your email and we’ll send you a code."
      }
    >
      {choosing ? <NewPasswordForm /> : <EmailForm onSendFailed={setSendError} />}
      <AuthFooter>
        Remembered it?{" "}
        <Link to="/sign-in" search={(prev) => prev} className="text-primary font-bold underline">
          Sign in
        </Link>
      </AuthFooter>
      <AuthFooter>
        New to Libri?{" "}
        <Link to="/sign-up" search={(prev) => prev} className="text-primary font-bold underline">
          Create an account
        </Link>
      </AuthFooter>
    </AuthShell>
  );
};

export const Route = createFileRoute("/forgot-password")({
  validateSearch: validateRedirectSearch,
  component: ForgotPasswordPage,
});
