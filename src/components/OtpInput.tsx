import { useRef, type ClipboardEvent, type ComponentProps, type KeyboardEvent } from "react";

import { CODE_LENGTH, fillDigits } from "#/lib/otp";

type Props = Omit<ComponentProps<"fieldset">, "onChange"> & {
  digits: string[];
  onChange: (digits: string[]) => void;
  onComplete?: (code: string) => Promise<void>;
  invalid?: boolean;
  shake?: boolean;
};

export const OtpInput = ({ digits, onChange, onComplete, invalid, shake, ...rest }: Props) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    onChange(next);
    if (next.every(Boolean) && next[CODE_LENGTH - 1] !== digits[CODE_LENGTH - 1])
      void onComplete?.(next.join(""));
  };

  const setAt = (i: number, ch: string) => {
    const next = digits.slice();
    next[i] = ch;
    commit(next);
  };

  const fill = (raw: string, at: number) => {
    const { next, focus, changed } = fillDigits(digits, raw, at);
    if (!changed) return;
    commit(next);
    refs.current[focus]?.focus();
  };

  const onInput = (i: number, v: string) => {
    const typed = digits[i] && v.length === 2 ? v.replace(digits[i], "") : v;
    if (typed.length > 1) return fill(typed, i);
    const ch = typed.replace(/\D/g, "");
    setAt(i, ch);
    if (ch && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setAt(i - 1, "");
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(e.clipboardData.getData("text"), i);
  };

  return (
    <fieldset {...rest} className="lb-otp" data-shake={shake ? "true" : undefined}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="lb-otp__box"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? CODE_LENGTH : d ? 2 : 1}
          value={d}
          aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => onPaste(i, e)}
        />
      ))}
    </fieldset>
  );
};
