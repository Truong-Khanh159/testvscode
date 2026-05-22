import { NextResponse } from "next/server";
import { hashPassword, requireUser, verifyPassword } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";
import { changePasswordSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) {
    return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  return NextResponse.json({ ok: true });
}
