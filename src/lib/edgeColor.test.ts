import { describe, expect, it } from "vitest";

import { edgeColor } from "./edgeColor";

describe("edgeColor", () => {
  it("averages only the outer ring of pixels", () => {
    const size = 4;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) data.set([200, 100, 50, 255], i * 4);
    for (const i of [5, 6, 9, 10]) data.set([0, 0, 0, 255], i * 4);
    expect(edgeColor(data, size)).toBe("rgb(200 100 50)");
  });
});
