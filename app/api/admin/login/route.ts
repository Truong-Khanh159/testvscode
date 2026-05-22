import { NextResponse } from "next/server";
import { createSession, ensureDefaultAdmin, verifyPassword } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const body = await request.json();
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");

  await ensureDefaultAdmin();

  const admin = await prisma.user.findUnique({ where: { email } });
  if (!admin || admin.isLocked || !["ADMIN", "STAFF"].includes(admin.role) || !(await verifyPassword(password, admin.passwordHash))) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  await createSession(admin, true);
  return NextResponse.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });
}
