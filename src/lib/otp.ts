export const CODE_LENGTH = 6;
export const EMPTY_DIGITS = Array<string>(CODE_LENGTH).fill("");

export const fillDigits = (digits: string[], raw: string, at: number) => {
  const pasted = raw.replace(/\D/g, "");
  const from = pasted.length >= CODE_LENGTH ? 0 : at;
  const clean = pasted.slice(0, CODE_LENGTH - from);
  const next = digits.slice();
  for (let k = 0; k < clean.length; k++) next[from + k] = clean[k];
  return { next, focus: Math.min(from + clean.length, CODE_LENGTH - 1), changed: clean.length > 0 };
};
