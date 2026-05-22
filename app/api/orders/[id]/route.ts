import { NextResponse } from "next/server";
import { requireAdmin, requireStaffOrAdmin } from "@/lib/server/auth";
import { sendCustomerCompletedEmail } from "@/lib/server/email";
import { withAdmin } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

type OrderRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: OrderRouteProps) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireStaffOrAdmin();
    const { id } = await params;
    const body = await request.json();
    const status = body.status;
    if (!["new", "confirmed", "completed", "canceled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true }
    });

    if (status === "completed") {
      await sendCustomerCompletedEmail(order);
    }

    return NextResponse.json(order);
  });
}

export async function DELETE(request: Request, { params }: OrderRouteProps) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
