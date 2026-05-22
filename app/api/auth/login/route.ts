import { NextResponse } from "next/server";
import { createSession, ensureDefaultAdmin, verifyPassword } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { checkRateLimit, getClientIp, requireCsrf } from "@/lib/server/security";
import { loginSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const ip = await getClientIp();
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Đăng nhập quá nhiều lần. Vui lòng thử lại sau." }, { status: 429 });
  }

  await ensureDefaultAdmin();
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Thông tin đăng nhập không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.isLocked || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
  }

  await createSession(user, Boolean(parsed.data.remember));
  return NextResponse.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
}
