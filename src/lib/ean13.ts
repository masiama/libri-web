const L = [
  "0001101",
  "0011001",
  "0010011",
  "0111101",
  "0100011",
  "0110001",
  "0101111",
  "0111011",
  "0110111",
  "0001011",
];
const R = L.map((c) =>
  c
    .split("")
    .map((b) => (b === "1" ? "0" : "1"))
    .join(""),
);
const G = R.map((c) => c.split("").reverse().join(""));
const PARITY = [
  "LLLLLL",
  "LLGLGG",
  "LLGGLG",
  "LLGGGL",
  "LGLLGG",
  "LGGLLG",
  "LGGGLL",
  "LGLGLG",
  "LGLGGL",
  "LGGLGL",
];

function ean13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10;
}

export function toIsbn13(code: string): string | null {
  const d = code.toUpperCase().replace(/[^\dX]/g, "");
  if (/^\d{13}$/.test(d)) return ean13CheckDigit(d) === Number(d[12]) ? d : null;
  if (!/^\d{9}[\dX]$/.test(d)) return null;

  const sum = d.split("").reduce((s, c, i) => s + (c === "X" ? 10 : Number(c)) * (10 - i), 0);
  if (sum % 11) return null;
  const first12 = `978${d.slice(0, 9)}`;
  return first12 + ean13CheckDigit(first12);
}

type Ean13Encoding = {
  digits: string;
  bits: string;
  isGuard: (moduleIndex: number) => boolean;
};

export function encodeEan13(code: string): Ean13Encoding | null {
  const d = toIsbn13(code);
  if (!d) return null;

  const parity = PARITY[Number(d[0])];
  let bits = "101";
  for (let i = 1; i <= 6; i++) bits += (parity[i - 1] === "L" ? L : G)[Number(d[i])];
  bits += "01010";
  for (let i = 7; i <= 12; i++) bits += R[Number(d[i])];
  bits += "101";

  return {
    digits: d,
    bits,
    isGuard: (i) => i < 3 || (i >= 45 && i < 50) || i >= 92,
  };
}
