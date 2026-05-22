"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { csrfFetch } from "@/lib/client/csrf";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bloome.vn");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await csrfFetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error || "Không thể đăng nhập");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <form className="glass rounded-[2rem] p-6 shadow-soft" onSubmit={handleLogin}>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-rosewood/55">Admin</p>
        <h1 className="mt-3 text-3xl font-black text-rosewood">Đăng nhập quản trị</h1>
        <p className="mt-2 text-sm text-rosewood/65">Trang này không được liên kết từ giao diện khách hàng.</p>
        <div className="mt-6 grid gap-4">
          <input className="focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3" onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
          <input className="focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3" onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" type="password" value={password} />
          <button className="focus-ring rounded-full bg-rosewood px-6 py-3 font-bold text-white shadow-soft" type="submit">
            Đăng nhập
          </button>
          {error ? <p className="text-sm font-bold text-rosewood">{error}</p> : null}
        </div>
      </form>
    </section>
  );
}
