import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

export async function GET() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(orders);
}
