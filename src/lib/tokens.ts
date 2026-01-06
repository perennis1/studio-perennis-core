//C:\Users\studi\my-next-app\src\lib\tokens.ts


export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  card: 16,
  pill: 999,
};

export const colors = {
  surface: "#0F172A",
  surfaceSoft: "#020617",
  borderSubtle: "rgba(148, 163, 184, 0.25)",
  textMuted: "#64748B",
  accent: "#00ADB5",
};

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
