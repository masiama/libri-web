import { describe, expect, it } from "vitest";

import { bookDims } from "./book3d";

describe("bookDims", () => {
  it("keeps today's shape until the sizes are known", () => {
    expect(bookDims({})).toEqual({ ratio: 1.48, depth: 0.2, backWidth: 1 });
  });

  it("makes a thin spine and a wide cover a thin, short book", () => {
    const d = bookDims({
      front: { w: 800, h: 1000 },
      spine: { w: 50, h: 1000 },
      back: { w: 800, h: 1000 },
    });
    expect(d.ratio).toBeCloseTo(1.25);
    expect(d.depth).toBeCloseTo(0.0625);
    expect(d.backWidth).toBeCloseTo(1);
  });

  it("keeps the back as tall as the front and gives it its own ratio's width", () => {
    expect(bookDims({ front: { w: 100, h: 150 }, back: { w: 100, h: 200 } }).backWidth).toBe(0.75);
  });

  it("never lets the back be wider than the front", () => {
    expect(bookDims({ front: { w: 100, h: 150 }, back: { w: 120, h: 150 } }).backWidth).toBe(1);
  });
});
