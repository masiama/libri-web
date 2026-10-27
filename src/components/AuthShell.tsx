import clsx from "clsx";

import { Barcode } from "#/components/Barcode";
import { HappyDino } from "#/components/Dino";
import { CircleAlert } from "#/components/icons";
import { Logo } from "#/components/Logo";
import { ThemeButton } from "#/components/ThemeToggle";

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

export const fieldClass =
  "lb-input md:h-13 md:rounded-2xl md:text-[1.0625rem] lg:h-12.5 lg:rounded-[14px] lg:text-base aria-invalid:border-danger";
export const labelClass = "lb-field__label md:text-[0.9375rem] lg:text-sm";
export const submitClass =
  "lb-btn lb-btn--primary lb-btn--lg lb-btn--block mt-1 md:min-h-14 md:text-[1.0625rem] lg:min-h-13.5 lg:text-base";
export const formClass =
  "bg-surface flex flex-col gap-3.5 rounded-[1.75rem] p-5 shadow-md md:gap-4 md:rounded-4xl md:p-8 lg:gap-4 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none";

export const AuthShell = ({
  title,
  subtitle,
  tile = (
    <div className="bg-surface grid size-24 place-items-center rounded-[30px] shadow-md md:hidden">
      <HappyDino size={64} />
    </div>
  ),
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle: React.ReactNode;
  tile?: React.ReactNode;
}>) => (
  <div className="relative lg:grid lg:min-h-dvh lg:grid-cols-2">
    <ThemeButton className="absolute top-4 right-4 z-10 md:top-6 md:right-6" />
    <main className="flex min-h-dvh flex-col items-center px-6 pt-6 pb-8 md:justify-center md:p-12 lg:p-14">
      <div className="lg:bg-surface relative flex w-full max-w-120 flex-col gap-6 md:gap-7 lg:max-w-105 lg:gap-4 lg:rounded-4xl lg:p-8 lg:shadow-lg">
        <header className="flex flex-col items-center gap-3.5 pt-5 text-center md:gap-2 md:pt-0 lg:items-start lg:gap-1.5 lg:pt-0 lg:pb-1 lg:text-left">
          {tile}
          <div className="max-md:hidden lg:hidden">
            <HappyDino size={170} />
          </div>
          <h1 className="font-display m-0 text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em] md:mt-5 md:text-4xl lg:mt-0 lg:text-[1.75rem]">
            {title}
          </h1>
          <p className="text-muted m-0 text-[0.9375rem] md:text-[1.0625rem] lg:text-[0.9375rem] lg:leading-normal">
            {subtitle}
          </p>
        </header>
        {children}
      </div>
    </main>
    <AboutPanel />
  </div>
);

export const AuthFooter = ({ children }: React.PropsWithChildren) => (
  <p className="text-muted m-0 text-center text-[0.9375rem] md:text-base lg:text-[0.9375rem]">
    {children}
  </p>
);

export const AuthBanner = ({ id, text, warn }: { id?: string; text: string; warn?: boolean }) => (
  <div
    id={id}
    role="alert"
    className={clsx(
      "flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm leading-[1.4] font-semibold",
      warn ? "bg-warn-soft text-warn-text" : "bg-danger-soft text-danger-text",
    )}
  >
    <CircleAlert size={20} strokeWidth={2.4} aria-hidden className="mt-px shrink-0" />
    <span>{text}</span>
  </div>
);
