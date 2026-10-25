import { getToken } from "@clerk/react";

export type BodyType<T> = T;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type FetchArgs = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: BodyType<unknown>;
  responseType?: string;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export const customFetch = async <T>(
  url: string,
  { method, body, responseType, headers: extraHeaders, signal }: FetchArgs,
): Promise<T> => {
  const token = await getToken();
  if (!token) throw new Error("User is not signed in");

  const isFormData = body instanceof FormData;
  const headers = new Headers(extraHeaders);
  headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    method,
    headers,
    signal,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status >= 400) {
    const message = await response.text().catch(() => "");
    throw new ApiError(message || `Request failed with status ${response.status}`, response.status);
  }

  if ([204, 205, 304].includes(response.status)) return undefined as T;
  if (responseType === "blob") return (await response.blob()) as T;
  const contentType = response.headers.get("Content-Type") ?? "";
  return (
    contentType.includes("application/json") ? await response.json() : await response.text()
  ) as T;
};

export default customFetch;
