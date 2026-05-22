import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/server/email";
import { generateOtp, hashOtp } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { checkRateLimit, getClientIp, requireCsrf } from "@/lib/server/security";
import { forgotPasswordSchema } from "@/lib/server/validation";

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const ip = await getClientIp();
  if (!checkRateLimit(`forgot:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." }, { status: 429 });
  }

  const parsed = forgotPasswordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const otp = generateOtp();
    await prisma.verificationToken.create({
      data: {
        email: parsed.data.email,
        userId: user.id,
        type: "RESET_PASSWORD",
        otpHash: await hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60_000)
      }
    });
    await sendOtpEmail(parsed.data.email, otp, "RESET_PASSWORD");
  }

  return NextResponse.json({ ok: true });
}
