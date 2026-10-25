import fc from "fast-check";
import { expect, test } from "vitest";

import { encodeEan13 } from "./ean13";

const digits = (n: number) => fc.stringMatching(new RegExp(`^\\d{${n}}$`));

const BITS_5901234123457 =
  "101" +
  ["0001011", "0100111", "0110011", "0010011", "0111101", "0011101"].join("") +
  "01010" +
  ["1100110", "1101100", "1000010", "1011100", "1001110", "1000100"].join("") +
  "101";

test("encodes a valid code to its bars", () => {
  expect(encodeEan13("5901234123457")).toMatchObject({
    digits: "5901234123457",
    bits: BITS_5901234123457,
  });
});

test("encodes all zeros with first digit 0 → all L codes", () => {
  expect(encodeEan13("0000000000000")?.bits).toBe(
    `101${"0001101".repeat(6)}01010${"1110010".repeat(6)}101`,
  );
});

test("encodes an ISBN to its bars", () => {
  expect(encodeEan13("9780261102217")?.bits).toBe(
    "101" +
      ["0111011", "0001001", "0100111", "0010011", "0000101", "0011001"].join("") +
      "01010" +
      ["1100110", "1110010", "1101100", "1101100", "1100110", "1000100"].join("") +
      "101",
  );
});

test("adds the check digit to 12 digits", () => {
  expect(encodeEan13("590123412345")?.digits).toBe("5901234123457");
  expect(encodeEan13("978026110221")?.digits).toBe("9780261102217");
  expect(encodeEan13("400638133393")?.digits).toBe("4006381333931");
  expect(encodeEan13("000000000001")?.digits).toBe("0000000000017");
});

test("the first digit sets the left-half parity", () => {
  fc.assert(
    fc.property(digits(12), (first12) => {
      const { bits } = encodeEan13(first12)!;
      const parity = Array.from({ length: 6 }, (_, i) =>
        bits.slice(3 + i * 7, 10 + i * 7).replaceAll("0", "").length % 2 ? "L" : "G",
      ).join("");
      expect(parity[0]).toBe("L");
      expect(parity.replaceAll("L", "").length).toBe(first12[0] === "0" ? 0 : 3);
    }),
  );
});

test("codes that differ only in the first digit draw different bars", () => {
  fc.assert(
    fc.property(digits(11), (rest) => {
      const all = new Set("0123456789".split("").map((d) => encodeEan13(d + rest)!.bits));
      expect(all.size).toBe(10);
    }),
  );
});

test("ignores hyphens and spaces", () => {
  expect(encodeEan13("978-0-261 10221-7")?.digits).toBe("9780261102217");
});

test.each(["9780261102218", "97802611022", "97802611022170", "", "abcdefghijklm"])(
  "draws nothing for %j",
  (code) => {
    expect(encodeEan13(code)).toBeNull();
  },
);

test("marks the start, middle and end guards", () => {
  const enc = encodeEan13("9780261102217")!;
  const guards = Array.from({ length: 95 }, (_, i) => i).filter(enc.isGuard);
  expect(guards).toEqual([0, 1, 2, 45, 46, 47, 48, 49, 92, 93, 94]);
});

test("any 12 digits plus their check digit encode to 95 modules", () => {
  fc.assert(
    fc.property(digits(12), (first12) => {
      const enc = encodeEan13(first12);
      expect(enc?.digits.startsWith(first12)).toBe(true);
      expect(enc?.bits).toMatch(/^101[01]{42}01010[01]{42}101$/);
      expect(encodeEan13(enc!.digits)?.bits).toBe(enc!.bits);
    }),
  );
});

test("changing one digit of a valid code makes it unencodable", () => {
  fc.assert(
    fc.property(digits(12), fc.nat(12), fc.nat(8), (first12, pos, shift) => {
      const valid = encodeEan13(first12)!.digits;
      const changed = String((Number(valid[pos]) + shift + 1) % 10);
      const broken = valid.slice(0, pos) + changed + valid.slice(pos + 1);
      expect(encodeEan13(broken)).toBeNull();
    }),
  );
});

test("codes of other lengths never encode", () => {
  fc.assert(
    fc.property(
      fc.stringMatching(/^\d*$/).filter((s) => s.length !== 12 && s.length !== 13),
      (code) => encodeEan13(code) === null,
    ),
  );
});
