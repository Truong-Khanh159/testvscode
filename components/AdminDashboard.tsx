"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { csrfFetch } from "@/lib/client/csrf";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/products";
import { type Order, useOrders } from "./OrderStore";
import { makeSlug, useProducts } from "./ProductStore";

const paletteOptions = [
  "from-blush via-white to-lavender",
  "from-sage via-white to-cream",
  "from-lavender via-white to-blush",
  "from-cream via-white to-blush",
  "from-rosewood via-blush to-white",
  "from-blush via-cream to-sage"
];

const emptyProduct: Product = {
  slug: "",
  name: "",
  price: 0,
  category: "",
  description: "",
  details: [],
  imageUrl: "",
  palette: paletteOptions[0],
  emoji: "💐"
};

type ProductFormState = Product & { detailsText: string };

type AdminUserRow = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "ADMIN" | "STAFF" | "USER";
  isLocked: boolean;
  createdAt: string;
};

function toProductForm(product: Product): ProductFormState {
  return { ...product, imageUrl: product.imageUrl || "", detailsText: product.details.join("\n") };
}

function playNotificationSound() {
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 740;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.36);
}

export function AdminDashboard() {
  const router = useRouter();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { orders, isUnauthorized, updateOrderStatus } = useOrders(true, 5000);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "users">("orders");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(toProductForm(emptyProduct));
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const knownOrderIds = useRef<Set<string> | null>(null);
  const newOrders = useMemo(() => orders.filter((order) => order.status === "new"), [orders]);
  const newUsers = useMemo(() => users.filter((user) => Date.now() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000), [users]);

  async function refreshUsers() {
    const response = await fetch("/api/admin/users", { cache: "no-store" });
    if (response.ok) setUsers(await response.json());
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (knownOrderIds.current === null) {
        knownOrderIds.current = new Set(orders.map((order) => order.id));
        return;
      }
      const incomingOrders = orders.filter((order) => !knownOrderIds.current?.has(order.id));
      if (incomingOrders.length > 0) {
        setToast(`Có ${incomingOrders.length} đơn hàng mới`);
        playNotificationSound();
      }
      knownOrderIds.current = new Set(orders.map((order) => order.id));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [orders]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => refreshUsers().catch(() => undefined), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (isUnauthorized) {
    router.replace("/admin/login");
    return null;
  }

  function updateProductField(name: keyof ProductFormState, value: string | number) {
    setProductForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function resetProductForm() {
    setEditingSlug(null);
    setProductForm(toProductForm(emptyProduct));
    setFormError("");
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const product: Product = {
      slug: productForm.slug || makeSlug(productForm.name),
      name: productForm.name.trim(),
      price: Number(productForm.price),
      category: productForm.category.trim(),
      description: productForm.description.trim(),
      details: productForm.detailsText.split(/\n|,/).map((detail) => detail.trim()).filter(Boolean),
      imageUrl: productForm.imageUrl?.trim() || null,
      palette: productForm.palette,
      emoji: productForm.emoji.trim() || "💐"
    };
    try {
      if (editingSlug) await updateProduct(editingSlug, product);
      else await addProduct(product);
      resetProductForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể lưu mặt hàng");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-2xl bg-rosewood px-5 py-3 text-sm font-bold text-white shadow-soft">{toast}</div> : null}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-rosewood/55">Admin dashboard</p>
          <h1 className="mt-3 text-4xl font-black text-rosewood">Quản trị cửa hàng</h1>
          <p className="mt-3 max-w-2xl text-rosewood/65">Admin tách riêng tại `/admin/dashboard`, không có link từ giao diện khách hàng.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-blush px-4 py-2 text-sm font-black text-rosewood">{newOrders.length} đơn mới</span>
          <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-rosewood shadow-sm" onClick={() => csrfFetch("/api/admin/logout", { method: "POST" }).then(() => router.replace("/admin/login"))} type="button">Đăng xuất</button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <AdminStat label="Doanh thu" value={formatCurrency(orders.reduce((sum, order) => sum + order.subtotal, 0))} />
        <AdminStat label="Tổng đơn" value={String(orders.length)} />
        <AdminStat label="Đơn mới" value={String(newOrders.length)} />
        <AdminStat label="Người dùng mới" value={String(newUsers.length)} />
      </div>

      <div className="mt-8 flex rounded-full bg-white/70 p-1 shadow-sm sm:w-fit">
        {(["orders", "products", "users"] as const).map((tab) => (
          <button className={`rounded-full px-5 py-2 text-sm font-bold transition ${activeTab === tab ? "bg-rosewood text-white" : "text-rosewood"}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
            {tab === "orders" ? "Đơn hàng" : tab === "products" ? "Mặt hàng" : "Người dùng"}
          </button>
        ))}
      </div>

      {activeTab === "orders" ? (
        <OrdersTable orders={orders} updateOrderStatus={updateOrderStatus} />
      ) : activeTab === "products" ? (
        <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
          <ProductForm editingSlug={editingSlug} error={formError} form={productForm} onCancel={resetProductForm} onChange={updateProductField} onSubmit={submitProduct} />
          <ProductList
            onDelete={(slug) => deleteProduct(slug).catch((error) => setFormError(error instanceof Error ? error.message : "Không thể xóa mặt hàng"))}
            onEdit={(product) => {
              setEditingSlug(product.slug);
              setProductForm(toProductForm(product));
              setFormError("");
            }}
            products={products}
          />
        </section>
      ) : (
        <UsersTable onChanged={refreshUsers} users={users} />
      )}
    </section>
  );
}

function AdminStat({ label, value }: { label: string; value: string }) {
  return <div className="glass rounded-[1.5rem] p-5 shadow-sm"><p className="text-sm font-bold uppercase tracking-[0.2em] text-rosewood/50">{label}</p><p className="mt-2 text-2xl font-black text-rosewood">{value}</p></div>;
}

function ProductForm({ editingSlug, error, form, onCancel, onChange, onSubmit }: { editingSlug: string | null; error: string; form: ProductFormState; onCancel: () => void; onChange: (name: keyof ProductFormState, value: string | number) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="glass h-fit rounded-[2rem] p-5 shadow-soft sm:p-6" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-rosewood">{editingSlug ? "Sửa mặt hàng" : "Thêm mặt hàng"}</h2>
        {editingSlug ? <button className="text-sm font-bold text-rosewood/65 hover:text-rosewood" onClick={onCancel} type="button">Hủy</button> : null}
      </div>
      <div className="mt-5 grid gap-4">
        <ProductInput label="Tên mặt hàng" name="name" onChange={onChange} required value={form.name} />
        <ProductInput label="Slug" name="slug" onChange={onChange} placeholder="Tự tạo nếu bỏ trống" value={form.slug} />
        <ProductInput label="Giá" name="price" onChange={onChange} required type="number" value={form.price} />
        <ProductInput label="Danh mục" name="category" onChange={onChange} required value={form.category} />
        <ProductInput label="URL ảnh sản phẩm" name="imageUrl" onChange={onChange} placeholder="https://..." value={form.imageUrl || ""} />
        <ProductInput label="Emoji" name="emoji" onChange={onChange} required value={form.emoji} />
        <label className="grid gap-2 text-sm font-bold text-rosewood">Màu nền<select className="focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3 font-normal" onChange={(event) => onChange("palette", event.target.value)} value={form.palette}>{paletteOptions.map((palette) => <option key={palette} value={palette}>{palette}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-bold text-rosewood">Mô tả<textarea className="focus-ring min-h-24 rounded-2xl border border-blush bg-white/85 px-4 py-3 font-normal" onChange={(event) => onChange("description", event.target.value)} required value={form.description} /></label>
        <label className="grid gap-2 text-sm font-bold text-rosewood">Chi tiết<textarea className="focus-ring min-h-28 rounded-2xl border border-blush bg-white/85 px-4 py-3 font-normal" onChange={(event) => onChange("detailsText", event.target.value)} placeholder="Mỗi dòng một chi tiết" value={form.detailsText} /></label>
        <button className="focus-ring rounded-full bg-rosewood px-6 py-3 font-bold text-white shadow-soft transition hover:-translate-y-0.5" type="submit">{editingSlug ? "Lưu thay đổi" : "Thêm mặt hàng"}</button>
        {error ? <p className="text-sm font-bold text-rosewood">{error}</p> : null}
      </div>
    </form>
  );
}

function ProductInput({ label, name, onChange, placeholder, required, type = "text", value }: { label: string; name: keyof ProductFormState; onChange: (name: keyof ProductFormState, value: string | number) => void; placeholder?: string; required?: boolean; type?: "number" | "text"; value: string | number }) {
  return <label className="grid gap-2 text-sm font-bold text-rosewood">{label}<input className="focus-ring rounded-2xl border border-blush bg-white/85 px-4 py-3 font-normal" min={type === "number" ? 0 : undefined} onChange={(event) => onChange(name, type === "number" ? Number(event.target.value) : event.target.value)} placeholder={placeholder} required={required} type={type} value={value} /></label>;
}

function ProductList({ onDelete, onEdit, products }: { onDelete: (slug: string) => void; onEdit: (product: Product) => void; products: Product[] }) {
  return <div className="space-y-4"><h2 className="text-2xl font-black text-rosewood">Danh sách mặt hàng</h2>{products.map((product) => <div className="glass grid gap-4 rounded-[1.5rem] p-4 shadow-sm md:grid-cols-[96px_1fr_auto]" key={product.slug}><div className={`relative grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${product.palette}`}>{product.imageUrl ? <Image alt={product.name} className="object-cover" fill sizes="96px" src={product.imageUrl} unoptimized /> : <span className="text-4xl">{product.emoji}</span>}</div><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-rosewood/50">{product.category}</p><h3 className="mt-1 text-xl font-black text-rosewood">{product.name}</h3><p className="mt-1 text-sm text-rosewood/65">{product.description}</p><p className="mt-2 font-black text-rosewood">{formatCurrency(product.price)}</p></div><div className="flex gap-2 md:flex-col"><button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-rosewood" onClick={() => onEdit(product)} type="button">Sửa</button><button className="rounded-full bg-blush px-4 py-2 text-sm font-bold text-rosewood" onClick={() => onDelete(product.slug)} type="button">Xóa</button></div></div>)}</div>;
}

function UsersTable({ onChanged, users }: { onChanged: () => Promise<void>; users: AdminUserRow[] }) {
  async function updateUser(id: number, body: Partial<AdminUserRow> & { password?: string }) {
    await csrfFetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await onChanged();
  }
  return <div className="mt-8 space-y-4"><h2 className="text-2xl font-black text-rosewood">Quản lý người dùng</h2>{users.map((user) => <article className="glass rounded-[1.5rem] p-5 shadow-sm" key={user.id}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h3 className="text-xl font-black text-rosewood">{user.fullName}</h3><p className="mt-1 text-sm text-rosewood/65">{user.email} · {user.phone}</p><p className="mt-2 text-sm font-bold text-rosewood">{user.role} · {user.isLocked ? "Đang khóa" : "Hoạt động"}</p></div><div className="flex flex-wrap gap-2"><select className="focus-ring rounded-full border border-blush bg-white px-4 py-2 text-sm font-bold text-rosewood" onChange={(event) => updateUser(user.id, { role: event.target.value as AdminUserRow["role"] })} value={user.role}><option value="ADMIN">ADMIN</option><option value="STAFF">STAFF</option><option value="USER">USER</option></select><button className="rounded-full bg-blush px-4 py-2 text-sm font-bold text-rosewood" onClick={() => updateUser(user.id, { isLocked: !user.isLocked })} type="button">{user.isLocked ? "Mở khóa" : "Khóa"}</button><button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-rosewood" onClick={() => updateUser(user.id, { password: "ChangeMe@123" })} type="button">Reset mật khẩu</button></div></div></article>)}</div>;
}

function OrdersTable({ orders, updateOrderStatus }: { orders: Order[]; updateOrderStatus: (id: string, status: Order["status"]) => Promise<void> }) {
  if (orders.length === 0) return <div className="glass mt-8 rounded-[2rem] p-10 text-center shadow-soft"><p className="text-5xl">🧾</p><h2 className="mt-4 text-2xl font-black text-rosewood">Chưa có đơn hàng</h2><p className="mt-2 text-rosewood/65">Đơn mới sẽ xuất hiện realtime sau khi khách gửi form đặt hàng.</p></div>;
  return <div className="mt-8 space-y-4">{orders.map((order) => <article className="glass rounded-[1.5rem] p-5 shadow-sm" key={order.id}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-rosewood/50">{order.id}</p><h3 className="mt-1 text-xl font-black text-rosewood">{order.customerName}</h3><p className="mt-1 text-sm text-rosewood/65">{order.phone} · {order.customerEmail || "Không có email"} · {new Date(order.createdAt).toLocaleString("vi-VN")}</p><StatusBadge status={order.status} /></div><div className="flex flex-wrap gap-2"><button className="rounded-full bg-sage px-4 py-2 text-sm font-bold text-rosewood disabled:opacity-50" disabled={order.status !== "new"} onClick={() => updateOrderStatus(order.id, "confirmed")} type="button">Xác nhận đơn</button><button className="rounded-full bg-white px-4 py-2 text-sm font-bold text-rosewood disabled:opacity-50" disabled={order.status === "completed" || order.status === "canceled"} onClick={() => updateOrderStatus(order.id, "completed")} type="button">Hoàn thành</button><button className="rounded-full bg-blush px-4 py-2 text-sm font-bold text-rosewood disabled:opacity-50" disabled={order.status === "completed" || order.status === "canceled"} onClick={() => updateOrderStatus(order.id, "canceled")} type="button">Hủy đơn</button></div></div><div className="mt-4 grid gap-3 text-sm text-rosewood/75 md:grid-cols-2"><p><span className="font-bold text-rosewood">Người đặt:</span> {order.customerName}</p><p><span className="font-bold text-rosewood">Người nhận:</span> {order.receiver || "Chưa nhập"}</p><p><span className="font-bold text-rosewood">Thời gian:</span> {order.deliveryTime || "Chưa nhập"}</p><p><span className="font-bold text-rosewood">Trạng thái:</span> {getStatusLabel(order.status)}</p><p className="md:col-span-2"><span className="font-bold text-rosewood">Địa chỉ:</span> {order.address}</p><p className="md:col-span-2"><span className="font-bold text-rosewood">Lời nhắn:</span> {order.message || "Không có"}</p></div><div className="mt-4 rounded-2xl bg-white/65 p-4">{order.items.length > 0 ? <ul className="space-y-2 text-sm text-rosewood/75">{order.items.map((item) => <li className="flex justify-between gap-4" key={`${order.id}-${item.slug}`}><span>{item.name} × {item.quantity}</span><span className="font-bold text-rosewood">{formatCurrency(item.price * item.quantity)}</span></li>)}</ul> : <p className="text-sm text-rosewood/65">Đơn tư vấn chưa chọn sản phẩm cụ thể.</p>}<p className="mt-3 text-right text-lg font-black text-rosewood">Tổng: {formatCurrency(order.subtotal)}</p></div></article>)}</div>;
}

function StatusBadge({ status }: { status: Order["status"] }) {
  return <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-rosewood">{getStatusLabel(status)}</span>;
}

function getStatusLabel(status: Order["status"]) {
  return { new: "Mới", confirmed: "Đã xác nhận", completed: "Hoàn thành", canceled: "Đã hủy" }[status];
}
