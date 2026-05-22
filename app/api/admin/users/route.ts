import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/server/auth";
import { withAdmin } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

export async function GET() {
  return withAdmin(async () => {
    await requireAdmin();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, email: true, phone: true, role: true, isLocked: true, createdAt: true }
    });
    return NextResponse.json(users);
  });
}

export async function POST(request: Request) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        fullName: String(body.fullName),
        email: String(body.email).toLowerCase(),
        phone: String(body.phone || ""),
        passwordHash: await hashPassword(String(body.password || "ChangeMe@123")),
        role: body.role || "USER",
        emailVerified: true
      },
      select: { id: true, fullName: true, email: true, phone: true, role: true, isLocked: true, createdAt: true }
    });
    return NextResponse.json(user, { status: 201 });
  });
}
