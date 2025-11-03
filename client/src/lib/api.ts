export const serverBase =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

// Build a URL usable on both server and client
export function api(path: string) {
  const base = typeof window === "undefined" ? serverBase : "/api";
  return `${base}${path}`;
}