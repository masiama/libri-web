import type { Ref } from "react";

import { CircleAlert } from "./icons";

type LoadFailedProps = {
  title: string;
  as?: "h1" | "h2";
  buttonRef?: Ref<HTMLButtonElement>;
  onRetry: () => void;
};

export const LoadFailed = ({ title, as: Heading = "h2", buttonRef, onRetry }: LoadFailedProps) => (
  <>
    <div className="lb-state__icon">
      <CircleAlert size={30} aria-hidden />
    </div>
    <Heading className="font-display m-0 text-[1.375rem] leading-[1.25] font-extrabold">
      {title}
    </Heading>
    <p className="text-muted m-0 text-[0.9375rem] leading-normal">
      Something went wrong on our side or with your connection. Try again in a moment.
    </p>
    <button
      ref={buttonRef}
      type="button"
      className="lb-btn lb-btn--primary mt-1.5 px-6 text-[0.9375rem]"
      onClick={onRetry}
    >
      Try again
    </button>
  </>
);
