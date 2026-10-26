import { useId, useState } from "react";

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
