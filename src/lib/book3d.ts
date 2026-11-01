export type Size = { w: number; h: number };
export type BookSizes = { front?: Size; spine?: Size; back?: Size };

const DEFAULT_RATIO = 1.48;
const DEFAULT_DEPTH = 0.2;

export const bookDims = ({ front, spine, back }: BookSizes) => {
  const ratio = front ? front.h / front.w : DEFAULT_RATIO;
  const depth = spine ? (spine.w / spine.h) * ratio : DEFAULT_DEPTH;
  const backRatio = back ? back.h / back.w : ratio;
  return { ratio, depth, backWidth: Math.min(1, ratio / backRatio) };
};
