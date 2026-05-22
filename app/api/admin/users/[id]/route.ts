import { NextResponse } from "next/server";
import { hashPassword, requireAdmin } from "@/lib/server/auth";
import { withAdmin } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

type UserRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: UserRouteProps) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        role: body.role,
        isLocked: typeof body.isLocked === "boolean" ? body.isLocked : undefined,
        passwordHash: body.password ? await hashPassword(String(body.password)) : undefined
      },
      select: { id: true, fullName: true, email: true, phone: true, role: true, isLocked: true, createdAt: true }
    });
    return NextResponse.json(user);
  });
}
