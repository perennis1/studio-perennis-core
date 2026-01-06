import { headers } from "next/headers";

export async function getServerBaseUrl() {
  const h = await headers();   // ⬅️ IMPORTANT
  const host = h.get("host");

  if (!host) {
    throw new Error("Cannot determine host");
  }

  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
