import { NextResponse } from "next/server";
import { hashPassword, verifyOtp } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";
import { resetPasswordSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const parsed = resetPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const token = await prisma.verificationToken.findFirst({
    where: { email: parsed.data.email, type: "RESET_PASSWORD", usedAt: null },
    orderBy: { createdAt: "desc" }
  });
  if (!token || token.expiresAt < new Date() || !(await verifyOtp(parsed.data.otp, token.otpHash))) {
    return NextResponse.json({ error: "OTP không đúng hoặc đã hết hạn" }, { status: 400 });
  }

  await prisma.user.update({ where: { email: parsed.data.email }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  await prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });

  return NextResponse.json({ ok: true });
}
