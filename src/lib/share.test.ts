import { expect, test, vi } from "vitest";

import { shareLink } from "./share";

const data = { title: "Nineteen Eighty-Four", url: "https://libri.test/books/9780141036144" };

const nav = (share?: (d: ShareData) => Promise<void>) => {
  const n = { share, clipboard: { writeText: vi.fn(async () => {}) } };
  vi.stubGlobal("navigator", n);
  return n;
};

test("opens the share sheet when there is one", async () => {
  const n = nav(vi.fn(async () => {}));
  expect(await shareLink(data)).toBe("shared");
  expect(n.share).toHaveBeenCalledWith(data);
  expect(n.clipboard.writeText).not.toHaveBeenCalled();
});

test("copies the link when there is no share sheet", async () => {
  const n = nav();
  expect(await shareLink(data)).toBe("copied");
  expect(n.clipboard.writeText).toHaveBeenCalledWith(data.url);
});

test("does nothing when the reader cancels the share sheet", async () => {
  const n = nav(() => Promise.reject(new DOMException("cancelled", "AbortError")));
  expect(await shareLink(data)).toBe("cancelled");
  expect(n.clipboard.writeText).not.toHaveBeenCalled();
});

test("copies the link when the share sheet fails", async () => {
  const n = nav(() => Promise.reject(new DOMException("blocked", "NotAllowedError")));
  expect(await shareLink(data)).toBe("copied");
  expect(n.clipboard.writeText).toHaveBeenCalledWith(data.url);
});

test("reports a failed copy", async () => {
  const n = nav();
  n.clipboard.writeText.mockRejectedValue(new Error("denied"));
  expect(await shareLink(data)).toBe("failed");
});
