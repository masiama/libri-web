import clsx from "clsx";
import { useState, type CSSProperties } from "react";

import { coverPaletteIndex, formatAuthors } from "#/lib/cover";

import { Barcode } from "./Barcode";

type CoverProps = {
  isbn: string;
  title: string;
  authors: string[];
  src?: string | null;
  width?: number;
  priority?: boolean;
  className?: string;
};

export const Cover = ({
  isbn,
  title,
  authors,
  src,
  width = 120,
  priority,
  className,
}: CoverProps) => {
  const [failedSrc, setFailedSrc] = useState<string>();
  const style = { "--cover-w": `${width}px` } as CSSProperties;
  const alt = `Cover of ${title}`;

  if (src && src !== failedSrc) {
    return (
      <div className={clsx("lb-cover", className)} style={style}>
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      </div>
    );
  }

  const palette = coverPaletteIndex(isbn);
  const len = title.length;
  const ratio = len <= 14 ? 0.115 : len <= 30 ? 0.095 : len <= 55 ? 0.078 : 0.068;
  const generatedStyle = {
    ...style,
    "--cover-bg": `var(--cover-${palette}-bg)`,
    "--cover-fg": `var(--cover-${palette}-fg)`,
    "--cover-lines": len <= 30 ? 4 : 6,
  } as CSSProperties;

  return (
    <div
      className={clsx("lb-cover lb-cover--generated", className)}
      style={generatedStyle}
      // A drawn cover, announced as one image like the real one.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="img"
      aria-label={alt}
    >
      <div className="lb-cover__body">
        <div className="lb-cover__title" style={{ fontSize: `max(8px, ${ratio * 100}cqw)` }}>
          {title}
        </div>
        <div className="lb-cover__spacer" />
        <div className="lb-cover__author">{formatAuthors(authors)}</div>
        <div className="lb-cover__barcode" aria-hidden="true">
          <Barcode code={isbn} module={1} height={20} showDigits={false} />
        </div>
      </div>
      <div className="lb-cover__initial">{title.charAt(0).toUpperCase()}</div>
    </div>
  );
};
