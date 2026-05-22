import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/server/email";
import { generateOtp, hashOtp, hashPassword } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { checkRateLimit, getClientIp, requireCsrf } from "@/lib/server/security";
import { registerSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const ip = await getClientIp();
  if (!checkRateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 });
  }

  const recentToken = await prisma.verificationToken.findFirst({
    where: {
      email: parsed.data.email,
      type: "REGISTER",
      usedAt: null,
      createdAt: { gt: new Date(Date.now() - 60_000) }
    }
  });
  if (recentToken) {
    return NextResponse.json({ error: "Vui lòng chờ 60 giây trước khi gửi OTP mới" }, { status: 429 });
  }

  const otp = generateOtp();
  await prisma.verificationToken.create({
    data: {
      email: parsed.data.email,
      type: "REGISTER",
      otpHash: await hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      payload: {
        ...parsed.data,
        passwordHash: await hashPassword(parsed.data.password),
        password: undefined
      }
    }
  });
  await sendOtpEmail(parsed.data.email, otp, "REGISTER");

  return NextResponse.json({ ok: true });
}
