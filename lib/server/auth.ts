import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { prisma } from "./prisma";

export const authCookieName = "bloome_auth_token";
const defaultAdminEmail = "admin@bloome.vn";
const defaultAdminPassword = "Admin@12345";

export type AuthUser = Pick<User, "id" | "email" | "fullName" | "phone" | "role" | "isLocked">;

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-jwt-secret-change-before-production";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function hashOtp(otp: string) {
  return bcrypt.hash(otp, 10);
}

export async function verifyOtp(otp: string, otpHash: string) {
  return bcrypt.compare(otp, otpHash);
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function ensureDefaultAdmin() {
  const email = process.env.ADMIN_EMAIL || defaultAdminEmail;
  const password = process.env.ADMIN_PASSWORD || defaultAdminPassword;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        fullName: "Bloomé Admin",
        email,
        phone: "0000000000",
        passwordHash: await hashPassword(password),
        role: "ADMIN",
        emailVerified: true
      }
    });
    return;
  }

  if (existingUser.role !== "ADMIN") {
    await prisma.user.update({ where: { id: existingUser.id }, data: { role: "ADMIN", emailVerified: true } });
  }
}

export async function createSession(user: AuthUser, remember = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const token = jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role } satisfies JwtPayload,
    getJwtSecret(),
    { expiresIn: maxAge }
  );
  const cookieStore = await cookies();

  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, email: true, fullName: true, phone: true, role: true, isLocked: true }
    });
  } catch {
    return null;
  }
}

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user || user.isLocked || (roles && !roles.includes(user.role))) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin() {
  return requireUser(["ADMIN"]);
}

export async function requireStaffOrAdmin() {
  return requireUser(["ADMIN", "STAFF"]);
}

export async function redirectIfUnauthenticated(roles?: Role[], loginPath = "/admin/login") {
  const user = await getCurrentUser();
  if (!user || user.isLocked || (roles && !roles.includes(user.role))) {
    redirect(loginPath);
  }
  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user && !user.isLocked && (user.role === "ADMIN" || user.role === "STAFF")) {
    redirect("/admin/dashboard");
  }
}
