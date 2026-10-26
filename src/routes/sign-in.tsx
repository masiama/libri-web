import { useSignIn, useUser } from "@clerk/react";
import { isClerkAPIResponseError } from "@clerk/react/errors";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { Barcode } from "#/components/Barcode";
import { HappyDino } from "#/components/Dino";
import { CircleAlert } from "#/components/icons";
import { BarSpinner } from "#/components/Loaders";
import { Logo } from "#/components/Logo";
import { ThemeButton } from "#/components/ThemeToggle";
import { safeRedirect, signInProblem, type SignInProblem } from "#/lib/auth";

const AboutPanel = () => (
  <section
    aria-label="About Libri"
    className="bg-primary text-on-primary hidden flex-col gap-7 bg-[radial-gradient(color-mix(in_srgb,var(--on-primary)_14%,transparent)_1.6px,transparent_1.8px)] bg-size-[18px_18px] px-16 py-14 lg:order-first lg:flex"
  >
    <div className="flex items-center gap-2.5">
      <Logo className="size-8.5 text-(--found-accent)!" />
      <span className="lb-wordmark text-[1.375rem]">libri</span>
    </div>
    <div className="flex max-w-130 flex-1 flex-col justify-center gap-7">
      <HappyDino size={220} color="var(--found-accent)" />
      <p className="font-display m-0 text-[2.75rem] leading-[1.1] font-extrabold tracking-[-0.03em]">
        Find any book by its barcode.
      </p>
      <p className="text-on-primary/90 m-0 text-lg leading-normal">
        Point your camera at the back cover, or type the number in. Libri does the looking up.
      </p>
    </div>
    <div className="flex items-center gap-4">
      <Barcode code="9780156012195" module={1.4} height={40} />
      <p className="text-on-primary/90 m-0 max-w-55 text-sm leading-[1.45]">
        That one is real. Try scanning it once you’re in.
      </p>
    </div>
  </section>
);

const fieldClass =
  "lb-input md:h-13 md:rounded-2xl md:text-[1.0625rem] lg:h-12.5 lg:rounded-[14px] lg:text-base aria-invalid:border-danger";
const labelClass = "lb-field__label md:text-[0.9375rem] lg:text-sm";

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
      const code = isClerkAPIResponseError(error)
        ? (error.errors[0]?.code ?? error.code)
        : error.code;
      return showProblem(signInProblem(code));
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
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="bg-surface flex flex-col gap-3.5 rounded-[1.75rem] p-5 shadow-md md:gap-4 md:rounded-4xl md:p-8 lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
    >
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
        className="lb-btn lb-btn--primary lb-btn--lg lb-btn--block mt-1 md:min-h-14 md:text-[1.0625rem] lg:min-h-13.5 lg:text-base"
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
  const { isLoaded, isSignedIn } = useUser();
  const { redirect } = Route.useSearch();
  const { history } = useRouter();
  const signedIn = isLoaded && isSignedIn;

  useEffect(() => {
    if (signedIn) history.replace(safeRedirect(redirect));
  }, [signedIn, history, redirect]);

  if (signedIn) return null;

  return (
    <div className="relative lg:grid lg:min-h-dvh lg:grid-cols-2">
      <ThemeButton className="absolute top-4 right-4 z-10 md:top-6 md:right-6" />
      <main className="flex min-h-dvh flex-col items-center px-6 pt-6 pb-8 md:justify-center md:p-12 lg:p-14">
        <div className="lg:bg-surface flex w-full max-w-120 flex-col gap-6 md:gap-7 lg:max-w-105 lg:gap-4 lg:rounded-4xl lg:p-8 lg:shadow-lg">
          <header className="flex flex-col items-center gap-3.5 pt-5 text-center md:gap-2 md:pt-0 lg:items-start lg:gap-1.5 lg:pt-0 lg:text-left">
            <div className="bg-surface grid size-24 place-items-center rounded-[30px] shadow-md md:hidden">
              <HappyDino size={64} />
            </div>
            <div className="max-md:hidden lg:hidden">
              <HappyDino size={170} />
            </div>
            <h1 className="font-display m-0 text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em] md:mt-5 md:text-4xl lg:mt-0">
              Welcome back
            </h1>
            <p className="text-muted m-0 text-[0.9375rem] md:text-[1.0625rem] lg:leading-normal">
              Good to see you again.
            </p>
          </header>
          <SignInForm />
        </div>
      </main>
      <AboutPanel />
    </div>
  );
};

export const Route = createFileRoute("/sign-in")({
  validateSearch: (search): { redirect?: string } =>
    typeof search.redirect === "string" ? { redirect: search.redirect } : {},
  component: SignInPage,
});
