export interface JWTPayload {
  userId: string;
  email: string;
  role: "traveler" | "admin";
  exp?: number;
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("travel_ai_token", token);
    document.cookie = `travel_ai_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("travel_ai_token");
  }
  return null;
}

export function destroyToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("travel_ai_token");
    document.cookie = "travel_ai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}
