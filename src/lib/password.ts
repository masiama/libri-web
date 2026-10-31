export const passwordStrength = (
  password: string,
): { level: 0 | 1 | 2 | 3; text: string; label: string } => {
  const length = password.length;
  if (length === 0) return { level: 0, text: "At least 8 characters", label: "" };
  if (length < 8) return { level: 1, text: `Too short: ${length} of 8`, label: "Too short" };
  if (length < 12) return { level: 2, text: `Good · ${length} characters`, label: "Good" };
  return { level: 3, text: `Strong · ${length} characters`, label: "Strong" };
};
