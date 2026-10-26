export const CoverSkeleton = () => (
  <div className="lb-book" aria-hidden="true">
    <div className="lb-skeleton aspect-[1/1.48]" />
    <div className="lb-book__title flex items-start py-[calc(0.5lh-5px)]">
      <div className="bg-surface-2 h-2.5 w-4/5 rounded-xs" />
    </div>
    <div className="lb-book__author flex items-center">
      <div className="bg-surface-2 h-2.5 w-1/2 rounded-xs" />
    </div>
  </div>
);

export const ScanSweep = ({ label }: { label: string }) => (
  // An indeterminate <progress> draws the browser's own bar under the laser.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  <div className="lb-sweep lb-bars" role="progressbar" aria-label={label}>
    <div className="lb-sweep__laser" />
  </div>
);
