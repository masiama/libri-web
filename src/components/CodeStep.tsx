import { useEffect, useId, useRef, useState } from "react";

import { AuthFooter, AuthShell, formClass, submitClass } from "#/components/AuthShell";
import { CircleAlert, Mail } from "#/components/icons";
import { BarSpinner } from "#/components/Loaders";
import { OtpInput } from "#/components/OtpInput";
import { clerkErrorCode, codeProblem, formatCountdown } from "#/lib/auth";
import { CODE_LENGTH, EMPTY_DIGITS } from "#/lib/otp";

export const useShowCodeStep = (needsCode: boolean, complete: boolean) => {
  const [seen, setSeen] = useState(false);
  const next = needsCode || (seen && complete);
  if (next !== seen) setSeen(next);
  return next;
};

const RESEND_SECONDS = 60;

type Result = Promise<{ error: ClerkError | null }>;

export type ClerkError = { code?: string };

type CodeStepProps = {
  email: string | null;
  initialError?: ClerkError;
  onVerify: (code: string) => Result;
  onResend: () => Result;
  onChangeEmail: () => void;
};

export const CodeStep = ({
  email,
  initialError,
  onVerify,
  onResend,
  onChangeEmail,
}: CodeStepProps) => {
  const idPrefix = useId();
  const otpRef = useRef<HTMLFieldSetElement>(null);
  const [digits, setDigits] = useState(EMPTY_DIGITS);
  const [pending, setPending] = useState(false);
  const [problem, setProblem] = useState(
    () => initialError && codeProblem(clerkErrorCode(initialError)),
  );
  const [shaking, setShaking] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(initialError ? 0 : RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join("");
  const wrong = problem?.kind === "wrong";
  const expired = problem?.kind === "expired";
  const limited = problem?.kind === "limited";
  const showError = !!problem && !expired && !limited;

  const verify = async (next: string) => {
    if (pending || limited) return;
    setPending(true);
    setProblem(undefined);
    setShaking(false);
    const { error } = await onVerify(next);
    if (!error) return;
    const failed = codeProblem(clerkErrorCode(error));
    setProblem(failed);
    const isWrong = failed.kind === "wrong";
    setShaking(isWrong);
    if (isWrong) otpRef.current?.querySelector<HTMLInputElement>("input:last-of-type")?.focus();
    setPending(false);
  };

  const resend = async () => {
    setPending(true);
    const { error } = await onResend();
    setPending(false);
    if (error) return setProblem(codeProblem(clerkErrorCode(error)));
    setProblem(undefined);
    setDigits(EMPTY_DIGITS);
    setSecondsLeft(RESEND_SECONDS);
  };

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (expired) return void resend();
    if (code.length === CODE_LENGTH) void verify(code);
  };

  return (
    <AuthShell
      title="Check your inbox"
      subtitle={
        <>
          We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
        </>
      }
      tile={
        <div className="bg-primary-soft text-primary grid size-18 place-items-center rounded-3xl md:hidden">
          <Mail size={34} strokeWidth={2} aria-hidden />
        </div>
      }
    >
      <form onSubmit={onSubmit} className={formClass}>
        {(expired || limited) && (
          <div
            role="alert"
            className="bg-warn-soft text-warn-text flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm leading-[1.4] font-semibold"
          >
            <CircleAlert size={20} strokeWidth={2.4} aria-hidden className="mt-px shrink-0" />
            <span>{problem.text}</span>
          </div>
        )}
        <div className="lb-field gap-2.5 lg:order-1">
          <span
            id={`${idPrefix}-code-label`}
            className="lb-field__label md:text-[0.9375rem] lg:text-sm"
          >
            Verification code
          </span>
          <OtpInput
            ref={otpRef}
            digits={digits}
            onChange={(next) => {
              setDigits(next);
              setShaking(false);
              if (wrong) setProblem(undefined);
            }}
            onComplete={verify}
            invalid={wrong}
            disabled={expired}
            shake={shaking}
            aria-labelledby={`${idPrefix}-code-label`}
            aria-describedby={showError ? `${idPrefix}-code-problem` : `${idPrefix}-code-hint`}
          />
          {showError ? (
            <p
              id={`${idPrefix}-code-problem`}
              role="alert"
              className="text-danger-text m-0 flex items-start gap-1.5 text-sm leading-[1.4] font-semibold"
            >
              <CircleAlert size={16} strokeWidth={2.4} aria-hidden className="mt-0.5 shrink-0" />
              <span>{problem.text}</span>
            </p>
          ) : (
            <p id={`${idPrefix}-code-hint`} className="lb-field__hint m-0 lg:hidden">
              Paste works too: all six digits land at once.
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          aria-disabled={limited || (!expired && code.length < CODE_LENGTH)}
          className={`${submitClass} lg:order-3`}
        >
          {pending ? (
            <>
              <BarSpinner label="Checking" />
              Checking…
            </>
          ) : expired ? (
            "Send a new code"
          ) : (
            "Verify"
          )}
        </button>
        <p className="text-muted m-0 text-center text-sm md:text-base lg:order-2 lg:-mt-1 lg:text-left lg:text-sm">
          Didn’t get it?{" "}
          {secondsLeft > 0 ? (
            <span className="font-mono font-medium">Resend in {formatCountdown(secondsLeft)}</span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => void resend()}
              className="text-primary font-bold underline"
            >
              Resend code
            </button>
          )}
        </p>
      </form>
      <AuthFooter>
        Wrong email?{" "}
        <button type="button" onClick={onChangeEmail} className="text-primary font-bold underline">
          Change it
        </button>
      </AuthFooter>
    </AuthShell>
  );
};
