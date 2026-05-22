import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ").toLowerCase(),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự")
});

export const verifyOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, "OTP gồm 6 số")
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
  remember: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase()
});

export const resetPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(8)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});
