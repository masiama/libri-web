import fc from "fast-check";
import { expect, test } from "vitest";

import { encodeEan13, suggestIsbnFix, toIsbn13 } from "./ean13";

const digits = (n: number) => fc.stringMatching(new RegExp(`^\\d{${n}}$`));

const withCheck = (first12: string) => {
  const sum = first12.split("").reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return first12 + ((10 - (sum % 10)) % 10);
};

const ean13 = digits(12).map(withCheck);

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

test("the first digit sets the left-half parity", () => {
  fc.assert(
    fc.property(ean13, (code) => {
      const { bits } = encodeEan13(code)!;
      const parity = Array.from({ length: 6 }, (_, i) =>
        bits.slice(3 + i * 7, 10 + i * 7).replaceAll("0", "").length % 2 ? "L" : "G",
      ).join("");
      expect(parity[0]).toBe("L");
      expect(parity.replaceAll("L", "").length).toBe(code[0] === "0" ? 0 : 3);
    }),
  );
});

test("codes that differ only in the first digit draw different bars", () => {
  fc.assert(
    fc.property(digits(11), (rest) => {
      const all = new Set(
        "0123456789".split("").map((d) => encodeEan13(withCheck(d + rest))!.bits),
      );
      expect(all.size).toBe(10);
    }),
  );
});

test("ignores hyphens and spaces", () => {
  expect(encodeEan13("978-0-261 10221-7")?.digits).toBe("9780261102217");
});

test.each(["9780261102218", "97802611022", "978026110221", "97802611022170", "", "abcdefghijklm"])(
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

test("any valid code encodes to 95 modules", () => {
  fc.assert(
    fc.property(ean13, (code) => {
      const enc = encodeEan13(code);
      expect(enc?.digits).toBe(code);
      expect(enc?.bits).toMatch(/^101[01]{42}01010[01]{42}101$/);
    }),
  );
});

test("changing one digit of a valid code makes it unencodable", () => {
  fc.assert(
    fc.property(ean13, fc.nat(12), fc.nat(8), (valid, pos, shift) => {
      const changed = String((Number(valid[pos]) + shift + 1) % 10);
      const broken = valid.slice(0, pos) + changed + valid.slice(pos + 1);
      expect(encodeEan13(broken)).toBeNull();
    }),
  );
});

test("codes of other lengths never encode", () => {
  fc.assert(
    fc.property(
      fc.stringMatching(/^\d*$/).filter((s) => s.length !== 10 && s.length !== 13),
      (code) => encodeEan13(code) === null,
    ),
  );
});

test.each([
  ["ISBN-13", "9780261102217", "9780261102217"],
  ["ISBN-10", "0261102214", "9780261102217"],
  ["ISBN-10", "0060589469", "9780060589462"],
  ["ISBN-10 ending in X", "080442957X", "9780804429573"],
  ["hyphenated ISBN-10", "0-261-10221-4", "9780261102217"],
])("turns an %s %s into %s", (_, code, isbn13) => {
  expect(toIsbn13(code)).toBe(isbn13);
});

test.each([
  ["bad ISBN-13 check digit", "9780261102218"],
  ["bad ISBN-10 check digit", "0261102215"],
  ["ISBN-10 with a wrong X", "026110221X"],
  ["12 digits", "978026110221"],
  ["empty", ""],
])("has no ISBN-13 for a %s", (_, code) => {
  expect(toIsbn13(code)).toBeNull();
});

const isbn10 = digits(9).chain((first9) => {
  const sum = first9.split("").reduce((s, d, i) => s + Number(d) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return fc.constant(first9 + (check === 10 ? "X" : check));
});

test("an ISBN-10 becomes 978 plus its first nine digits and a valid check digit", () => {
  fc.assert(
    fc.property(isbn10, (code) => {
      const isbn13 = toIsbn13(code);
      expect(isbn13?.slice(0, 12)).toBe(`978${code.slice(0, 9)}`);
      expect(toIsbn13(isbn13!)).toBe(isbn13);
    }),
  );
});

test("changing one digit of an ISBN-13 gives no ISBN-13", () => {
  fc.assert(
    fc.property(ean13, fc.nat(12), fc.integer({ min: 1, max: 9 }), (code, pos, shift) => {
      const changed = String((Number(code[pos]) + shift) % 10);
      expect(toIsbn13(code.slice(0, pos) + changed + code.slice(pos + 1))).toBeNull();
    }),
  );
});

test("an ISBN-10 draws the same bars as its ISBN-13", () => {
  expect(encodeEan13("0261102214")).toMatchObject({
    digits: "9780261102217",
    bits: encodeEan13("9780261102217")!.bits,
  });
});

test.each([
  ["9780261102218", "9780261102217"],
  ["9780141036145", "9780141036144"],
  ["979-10-323-0556-1", "9791032305560"],
])("suggests a fix for %s", (code, fix) => {
  expect(suggestIsbnFix(code)).toBe(fix);
});

test.each([
  ["valid ISBN-13", "9780261102217"],
  ["store barcode with a bad check digit", "4006381333932"],
  ["store SKU", "SKU-12345"],
  ["ISBN-10 with a bad check digit", "0261102215"],
  ["12 digits", "978026110221"],
  ["empty", ""],
])("suggests nothing for a %s", (_, code) => {
  expect(suggestIsbnFix(code)).toBeNull();
});

test("a bad 978/979 code always gets a valid ISBN-13 with the same first twelve digits", () => {
  fc.assert(
    fc.property(fc.constantFrom("978", "979"), digits(10), (prefix, rest) => {
      const code = prefix + rest;
      const fix = suggestIsbnFix(code);
      if (toIsbn13(code)) {
        expect(fix).toBeNull();
      } else {
        expect(fix?.slice(0, 12)).toBe(code.slice(0, 12));
        expect(toIsbn13(fix!)).toBe(fix);
      }
    }),
  );
});
