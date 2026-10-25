export const shareLink = async (data: {
  title: string;
  url: string;
}): Promise<"shared" | "copied" | "cancelled" | "failed"> => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return "copied";
  } catch {
    return "failed";
  }
};
