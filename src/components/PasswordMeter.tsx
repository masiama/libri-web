import { passwordStrength } from "#/lib/password";

export const PasswordMeter = ({ id, password }: { id: string; password: string }) => {
  const { level, text } = passwordStrength(password);
  return (
    <>
      <div aria-hidden className="lb-meter mt-1">
        <div className="lb-meter__fill" data-level={level} />
      </div>
      <p id={id} data-level={level} className="lb-meter-hint m-0 text-[0.8125rem] font-semibold">
        {text}
      </p>
    </>
  );
};
