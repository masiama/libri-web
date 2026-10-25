import type { ReactElement } from "react";

import { encodeEan13 } from "#/lib/ean13";

type BarcodeProps = {
  code: string;
  module: number;
  height: number;
  showDigits?: boolean;
};

export const Barcode = ({ code, module, height, showDigits = true }: BarcodeProps) => {
  const encoding = encodeEan13(code);
  if (!encoding) return null;

  const quietLeft = 9;
  const quietRight = 4;
  const guardExtra = showDigits ? 5 : 0;
  const digitsHeight = showDigits ? 8 : 0;
  const totalWidth = quietLeft + 95 + quietRight;
  const totalHeight = height / module + Math.max(guardExtra, digitsHeight) + 2;

  const rects: ReactElement[] = [];
  for (let i = 0; i < 95;) {
    if (encoding.bits[i] !== "1") {
      i++;
      continue;
    }
    let j = i;
    while (j < 95 && encoding.bits[j] === "1" && encoding.isGuard(j) === encoding.isGuard(i)) j++;
    const tall = encoding.isGuard(i);
    rects.push(
      <rect
        key={i}
        x={quietLeft + i}
        y={1}
        width={j - i}
        height={height / module + (tall ? guardExtra : 0)}
      />,
    );
    i = j;
  }

  const { digits } = encoding;
  const textY = 1 + height / module + digitsHeight - 1;
  return (
    <svg
      // Inline SVG needs role="img" to be announced as one image.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="img"
      aria-label={`Barcode for ${digits}`}
      width={totalWidth * module}
      height={totalHeight * module}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      shapeRendering="crispEdges"
      style={{ background: "var(--barcode-bg)", borderRadius: module * 4, display: "block" }}
    >
      <g style={{ fill: "var(--barcode-ink)" }}>{rects}</g>
      {showDigits && (
        <g
          style={{ fill: "var(--barcode-ink)" }}
          fontFamily="'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, monospace"
          fontSize={7}
          textAnchor="middle"
          shapeRendering="auto"
        >
          <text x={quietLeft / 2} y={textY}>
            {digits[0]}
          </text>
          <text x={quietLeft + 3 + 21} y={textY} textLength={38} lengthAdjust="spacing">
            {digits.slice(1, 7)}
          </text>
          <text x={quietLeft + 50 + 21} y={textY} textLength={38} lengthAdjust="spacing">
            {digits.slice(7)}
          </text>
        </g>
      )}
    </svg>
  );
};
