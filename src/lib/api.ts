export const API_BASE_URL = (() => {
  const value = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "http://localhost:5000";
})();

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, token, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiResponse<T>) : null;

  if (!response.ok) {
    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  if (!payload?.success) {
    throw new ApiError(payload?.message || "Unexpected API response", response.status);
  }

  return payload.data as T;
}
