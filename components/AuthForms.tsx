"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { csrfFetch } from "@/lib/client/csrf";

function Field({ name, placeholder, type = "text", value, onChange }: { name: string; placeholder: string; type?: string; value: string; onChange: (value: string) => void }) {
  return <input className="focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3 dark:bg-white/10" name={name} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />;
}

function AuthShell({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="mx-auto max-w-md px-4 py-14"><div className="glass rounded-[2rem] p-6 shadow-soft"><h1 className="text-3xl font-black text-rosewood">{title}</h1>{children}</div></section>;
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "otp">("register");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Đang gửi OTP...");
    const response = await csrfFetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error || "Không thể đăng ký");
    setStep("otp");
    setMessage("OTP đã được gửi tới email. Mã hết hạn sau 5 phút.");
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await csrfFetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, otp }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error || "OTP không hợp lệ");
    router.push("/");
    router.refresh();
  }

  return <AuthShell title="Đăng ký">{step === "register" ? <form className="mt-6 grid gap-4" onSubmit={submitRegister}><Field name="fullName" onChange={(value) => setForm({ ...form, fullName: value })} placeholder="Họ tên" value={form.fullName} /><Field name="email" onChange={(value) => setForm({ ...form, email: value })} placeholder="Email" type="email" value={form.email} /><Field name="phone" onChange={(value) => setForm({ ...form, phone: value })} placeholder="Số điện thoại" value={form.phone} /><Field name="password" onChange={(value) => setForm({ ...form, password: value })} placeholder="Mật khẩu" type="password" value={form.password} /><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Gửi OTP</button></form> : <form className="mt-6 grid gap-4" onSubmit={submitOtp}><Field name="otp" onChange={setOtp} placeholder="OTP 6 số" value={otp} /><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Xác nhận OTP</button></form>}{message ? <p className="mt-4 text-sm font-bold text-rosewood">{message}</p> : null}</AuthShell>;
}

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState(admin ? "admin@bloome.vn" : "");
  const [password, setPassword] = useState(admin ? "Admin@12345" : "");
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await csrfFetch(admin ? "/api/admin/login" : "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, remember }) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error || "Không thể đăng nhập");
    router.push(admin ? "/admin/dashboard" : "/");
    router.refresh();
  }

  return <AuthShell title={admin ? "Đăng nhập admin" : "Đăng nhập"}><form className="mt-6 grid gap-4" onSubmit={submit}><Field name="email" onChange={setEmail} placeholder="Email" type="email" value={email} /><Field name="password" onChange={setPassword} placeholder="Mật khẩu" type="password" value={password} /><label className="flex items-center gap-2 text-sm text-rosewood"><input checked={remember} onChange={(event) => setRemember(event.target.checked)} type="checkbox" /> Remember me</label><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Đăng nhập</button></form>{message ? <p className="mt-4 text-sm font-bold text-rosewood">{message}</p> : null}</AuthShell>;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await csrfFetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setMessage(response.ok ? "Nếu email tồn tại, OTP reset đã được gửi." : "Không thể gửi OTP");
  }
  return <AuthShell title="Quên mật khẩu"><form className="mt-6 grid gap-4" onSubmit={submit}><Field name="email" onChange={setEmail} placeholder="Email" type="email" value={email} /><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Gửi OTP reset</button></form>{message ? <p className="mt-4 text-sm font-bold text-rosewood">{message}</p> : null}</AuthShell>;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await csrfFetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error || "Không thể reset mật khẩu");
    router.push("/login");
  }
  return <AuthShell title="Đặt lại mật khẩu"><form className="mt-6 grid gap-4" onSubmit={submit}><Field name="email" onChange={(value) => setForm({ ...form, email: value })} placeholder="Email" type="email" value={form.email} /><Field name="otp" onChange={(value) => setForm({ ...form, otp: value })} placeholder="OTP 6 số" value={form.otp} /><Field name="password" onChange={(value) => setForm({ ...form, password: value })} placeholder="Mật khẩu mới" type="password" value={form.password} /><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Đổi mật khẩu</button></form>{message ? <p className="mt-4 text-sm font-bold text-rosewood">{message}</p> : null}</AuthShell>;
}

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await csrfFetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const body = await response.json();
    setMessage(response.ok ? "Đã đổi mật khẩu" : body.error || "Không thể đổi mật khẩu");
  }
  return <AuthShell title="Đổi mật khẩu"><form className="mt-6 grid gap-4" onSubmit={submit}><Field name="currentPassword" onChange={(value) => setForm({ ...form, currentPassword: value })} placeholder="Mật khẩu hiện tại" type="password" value={form.currentPassword} /><Field name="newPassword" onChange={(value) => setForm({ ...form, newPassword: value })} placeholder="Mật khẩu mới" type="password" value={form.newPassword} /><button className="rounded-full bg-rosewood px-6 py-3 font-bold text-white">Đổi mật khẩu</button></form>{message ? <p className="mt-4 text-sm font-bold text-rosewood">{message}</p> : null}</AuthShell>;
}
