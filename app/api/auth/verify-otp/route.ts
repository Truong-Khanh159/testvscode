import { NextResponse } from "next/server";
import { createSession, verifyOtp } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";
import { verifyOtpSchema } from "@/lib/server/validation";

type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
};

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const parsed = verifyOtpSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "OTP không hợp lệ" }, { status: 400 });
  }

  const token = await prisma.verificationToken.findFirst({
    where: { email: parsed.data.email, type: "REGISTER", usedAt: null },
    orderBy: { createdAt: "desc" }
  });
  if (!token || token.expiresAt < new Date() || !(await verifyOtp(parsed.data.otp, token.otpHash))) {
    return NextResponse.json({ error: "OTP không đúng hoặc đã hết hạn" }, { status: 400 });
  }

  const payload = token.payload as RegisterPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      passwordHash: payload.passwordHash,
      emailVerified: true,
      role: "USER"
    },
    select: { id: true, email: true, fullName: true, phone: true, role: true, isLocked: true }
  });
  await prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date(), userId: user.id } });
  await createSession(user, true);

  return NextResponse.json({ user });
}
