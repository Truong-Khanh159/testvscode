import nodemailer from "nodemailer";
import { formatCurrency } from "@/lib/format";

const adminNotificationEmail = "truongkhanh13572468@gmail.com";

type EmailOrder = {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  phone: string;
  address: string;
  subtotal: number;
};

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export async function sendAdminNewOrderEmail(order: EmailOrder) {
  const transporter = getTransporter();
  const subject = `Bloomé có đơn hàng mới: ${order.id}`;
  const text = [
    `Có đơn đặt hàng mới từ ${order.customerName}`,
    `Email: ${order.customerEmail || "Không có"}`,
    `SĐT: ${order.phone}`,
    `Địa chỉ: ${order.address}`,
    `Tổng: ${formatCurrency(order.subtotal)}`
  ].join("\n");

  if (!transporter) {
    console.info("[email skipped]", { to: adminNotificationEmail, subject, text });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminNotificationEmail,
    subject,
    text
  });
}

export async function sendOtpEmail(email: string, otp: string, type: "REGISTER" | "RESET_PASSWORD") {
  const transporter = getTransporter();
  const subject = type === "REGISTER" ? "Mã xác nhận tài khoản Bloomé" : "Mã đặt lại mật khẩu Bloomé";
  const html = `
    <div style="font-family:Arial,sans-serif;background:#fff7ed;padding:28px">
      <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:24px;padding:28px;border:1px solid #fadadd">
        <h1 style="color:#8e4754;margin:0">Bloomé Flower Shop</h1>
        <p style="color:#6f3340;font-size:16px">Mã OTP của bạn có hiệu lực trong 5 phút.</p>
        <div style="font-size:34px;letter-spacing:8px;font-weight:800;color:#8e4754;background:#fadadd;padding:18px;border-radius:18px;text-align:center">${otp}</div>
        <p style="color:#8e4754;font-size:13px">Không chia sẻ mã này cho bất kỳ ai.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.info("[email skipped]", { to: email, subject, otp });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    html
  });
}

export async function sendCustomerCompletedEmail(order: EmailOrder) {
  if (!order.customerEmail) {
    return;
  }

  const transporter = getTransporter();
  const subject = `Đơn hàng ${order.id} đã hoàn thành`;
  const text = [
    `Bloomé đã hoàn thành đơn hàng ${order.id}.`,
    `Cảm ơn ${order.customerName} đã đặt hoa tại Bloomé.`,
    `Tổng đơn: ${formatCurrency(order.subtotal)}`
  ].join("\n");

  if (!transporter) {
    console.info("[email skipped]", { to: order.customerEmail, subject, text });
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: order.customerEmail,
    subject,
    text
  });
}
