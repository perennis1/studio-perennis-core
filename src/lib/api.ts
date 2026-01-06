// src/lib/api.ts - Simple version to fix parsing error
import { getStoredToken } from "@/lib/tokens";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchFromAPI(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("AUTH_EXPIRED");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({
      message: `HTTP ${res.status}`,
    }));
    throw new Error(error.message);
  }

  return res.json();
}
