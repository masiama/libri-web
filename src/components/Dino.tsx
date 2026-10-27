import { useEffect, useId, useRef, useState } from "react";

import { coverPaletteIndex } from "#/lib/cover";

import { DinoBody } from "./Logo";

export const ConfusedDino = ({
  size = 140,
  question = true,
}: {
  size?: number;
  question?: boolean;
}) => (
  <svg
    viewBox="-40 -80 540 520"
    width={size}
    height={(size * 520) / 540}
    aria-hidden="true"
    style={{ color: "var(--logo)" }}
  >
    <DinoBody strokeWidth={30} />
    <path d="M300 135l30 14l30-14l30 14l30-14" fill="none" stroke="currentColor" strokeWidth={22} />
    <path
      d="M332 57l26 26M358 57l-26 26"
      strokeWidth={12}
      strokeLinecap="round"
      style={{ stroke: "var(--dino-eye)" }}
    />
    {question && (
      <text
        x={440}
        y={10}
        fontSize={80}
        fontWeight={800}
        style={{ fontFamily: "var(--font-display)", fill: "var(--primary)" }}
      >
        ?
      </text>
    )}
  </svg>
);

export const HappyDino = ({
  size = 140,
  color = "var(--logo)",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    viewBox="-40 -80 540 520"
    width={size}
    height={(size * 520) / 540}
    aria-hidden="true"
    style={{ color }}
  >
    <DinoBody strokeWidth={30} />
    <path d="M300 135h120" stroke="currentColor" strokeWidth={30} />
    <path
      d="M323 82q22-30 44 0"
      fill="none"
      strokeWidth={14}
      strokeLinecap="round"
      style={{ stroke: "var(--dino-eye)" }}
    />
  </svg>
);

type ReadingRexProps = { isbn: string; coverSrc: string; className?: string };

export const ReadingRex = ({ isbn, coverSrc, className }: ReadingRexProps) => {
  const palette = coverPaletteIndex(isbn);
  const clipId = useId();
  const [failedSrc, setFailedSrc] = useState<string>();

  return (
    <svg
      viewBox="-40 -80 540 520"
      width={84}
      height={(84 * 520) / 540}
      aria-hidden="true"
      className={className}
      style={{ color: "var(--logo)" }}
    >
      <DinoBody strokeWidth={30} />
      <path d="M75 345h40v45h20v20h-60zM285 345h40v45h20v20h-60z" fill="currentColor" />
      <rect
        x={415}
        y={150}
        width={70}
        height={96}
        rx={6}
        style={{ fill: `var(--cover-${palette}-bg)` }}
      />
      <rect x={415} y={150} width={12} height={96} style={{ fill: `var(--cover-${palette}-fg)` }} />
      <clipPath id={clipId}>
        <rect x={415} y={150} width={70} height={96} rx={6} />
      </clipPath>
      {coverSrc !== failedSrc && (
        <image
          href={coverSrc}
          x={415}
          y={150}
          width={70}
          height={96}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
          onError={() => setFailedSrc(coverSrc)}
        />
      )}
      <path d="M405 225h30" fill="none" stroke="currentColor" strokeWidth={24} />
      <path d="M300 135h120" stroke="currentColor" strokeWidth={30} />
      <rect x={335} y={70} width={28} height={14} style={{ fill: "var(--dino-eye)" }} />
    </svg>
  );
};

export type PeekMood = "idle" | "reading" | "shy" | "confused" | "excited";

const strokeEyes: Partial<Record<PeekMood, [d: string, width: number]>> = {
  shy: ["M326 74q19 14 38 0", 12],
  confused: ["M332 57l26 26M358 57l-26 26", 12],
  excited: ["M323 82q22-30 44 0", 14],
};

const PeekEye = ({ mood, look }: { mood: PeekMood; look: { x: number; y: number } }) => {
  const stroke = strokeEyes[mood];
  if (stroke)
    return (
      <path
        d={stroke[0]}
        fill="none"
        strokeWidth={stroke[1]}
        strokeLinecap="round"
        style={{ stroke: "var(--dino-eye)" }}
      />
    );
  const [gx, gy] = mood === "reading" ? [340, 74] : [345, 70];
  return (
    <>
      <circle cx={345} cy={70} r={16} style={{ fill: "var(--dino-eye)" }} />
      <circle
        cx={gx}
        cy={gy}
        r={5}
        style={{
          fill: "var(--dino-fill)",
          transform: mood === "idle" ? `translate(${look.x}px, ${look.y}px)` : undefined,
          transition: "transform 0.1s",
        }}
      />
    </>
  );
};

const peekJaw: Partial<Record<PeekMood, React.ReactNode>> = {
  confused: (
    <path d="M300 135l30 14l30-14l30 14l30-14" fill="none" stroke="currentColor" strokeWidth={22} />
  ),
  excited: <path d="M300 140L425 185" stroke="currentColor" strokeWidth={30} />,
};

const useLook = (mood: PeekMood) => {
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (mood !== "idle" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = e.clientX - (box.left + box.width * 0.62);
      const dy = e.clientY - (box.top + box.height * 0.42);
      const scale = Math.min(1, Math.hypot(dx, dy) / 200) * 8;
      const angle = Math.atan2(dy, dx);
      setLook({ x: Math.cos(angle) * scale, y: Math.sin(angle) * scale });
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [mood]);
  return { ref, look };
};

export const PeekingDino = ({ mood, className }: { mood: PeekMood; className?: string }) => {
  const { ref, look } = useLook(mood);
  return (
    <svg
      ref={ref}
      viewBox="230 0 210 165"
      aria-hidden="true"
      className={className}
      style={{ color: "var(--logo)" }}
    >
      <g key={mood} className="lb-peek">
        <path
          d="M255 170V15h150v155"
          strokeWidth={30}
          stroke="currentColor"
          style={{ fill: "var(--dino-fill)" }}
        />
        <path d="M270 30h120v90h-90l-30 30" fill="currentColor" opacity={0.3} />
        {peekJaw[mood] ?? <path d="M300 135h120" stroke="currentColor" strokeWidth={30} />}
        <PeekEye mood={mood} look={look} />
      </g>
    </svg>
  );
};
