"use client"

export async function signOut(): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  try {
    await fetch(`${apiBase}/api/auth/signout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
  }
}
export default signOut;
