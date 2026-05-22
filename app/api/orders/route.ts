import { NextResponse } from "next/server";
import { getCurrentUser, requireStaffOrAdmin } from "@/lib/server/auth";
import { sendAdminNewOrderEmail } from "@/lib/server/email";
import { badRequestResponse, withAdmin } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

function mapOrder(order: Awaited<ReturnType<typeof prisma.order.findMany>>[number]) {
  return order;
}

export async function GET() {
  return withAdmin(async () => {
    await requireStaffOrAdmin();
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(orders.map(mapOrder));
  });
}

export async function POST(request: Request) {
  const csrfError = await requireCsrf(request);
  if (csrfError) return csrfError;

  const currentUser = await getCurrentUser();
  const order = await request.json();

  if (!order.customerName || !order.phone || !order.address) {
    return badRequestResponse("Thiếu thông tin đặt hàng bắt buộc");
  }

  const createdOrder = await prisma.order.create({
    data: {
      id: String(order.id || `ORD-${Date.now()}`),
      userId: currentUser?.id,
      customerName: String(order.customerName),
      customerEmail: String(order.customerEmail || currentUser?.email || ""),
      phone: String(order.phone),
      receiver: String(order.receiver || ""),
      deliveryTime: String(order.deliveryTime || ""),
      address: String(order.address),
      message: String(order.message || ""),
      subtotal: Number(order.subtotal || 0),
      items: {
        create: Array.isArray(order.items)
          ? order.items.map((item: { slug: string; name: string; price: number; quantity: number }) => ({
              slug: String(item.slug),
              name: String(item.name),
              price: Number(item.price),
              quantity: Number(item.quantity)
            }))
          : []
      }
    },
    include: { items: true }
  });

  await sendAdminNewOrderEmail(createdOrder);

  return NextResponse.json(createdOrder, { status: 201 });
}
