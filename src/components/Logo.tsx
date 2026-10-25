import clsx from "clsx";

export const DinoBody = ({ strokeWidth }: { strokeWidth: number }) => (
  <>
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      d="M240 15h165v330H15v-90h120V135h120V15"
    />
    <path fill="currentColor" opacity="0.55" d="M150 150h120v90H150z" />
    <path fill="currentColor" opacity="0.3" d="M270 30h120v90h-90l-30 30" />
  </>
);

export const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="-20 -40 460 440" aria-hidden="true" className={clsx("text-logo", className)}>
    <DinoBody strokeWidth={34} />
    <path stroke="currentColor" strokeWidth="34" d="M300 135h120" />
    <circle cx="345" cy="70" r="18" className="fill-ink" />
  </svg>
);
