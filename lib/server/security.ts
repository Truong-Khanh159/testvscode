import { randomBytes } from "crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();
export const csrfCookieName = "bloome_csrf";

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || record.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function getClientIp() {
  const headerStore = await headers();
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function issueCsrfToken() {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(csrfCookieName, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return token;
}

export async function requireCsrf(request: Request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(csrfCookieName)?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: "CSRF token không hợp lệ" }, { status: 403 });
  }

  return null;
}
