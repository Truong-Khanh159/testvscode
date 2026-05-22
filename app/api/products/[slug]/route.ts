import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { badRequestResponse, withAdmin } from "@/lib/server/http";
import { mapProduct, seedProductsIfEmpty } from "@/lib/server/products";
import { prisma } from "@/lib/server/prisma";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

type ProductRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: ProductRouteProps) {
  await seedProductsIfEmpty();
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(mapProduct(product));
}

export async function PUT(request: Request, { params }: ProductRouteProps) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const { slug } = await params;
    const product = await request.json();

    if (!product.slug || !product.name || !product.category || !product.description) {
      return badRequestResponse("Thiếu thông tin sản phẩm bắt buộc");
    }

    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        slug: String(product.slug),
        name: String(product.name),
        price: Number(product.price),
        category: String(product.category),
        description: String(product.description),
        details: Array.isArray(product.details) ? product.details : [],
        imageUrl: product.imageUrl ? String(product.imageUrl) : null,
        palette: String(product.palette || "from-blush via-white to-lavender"),
        emoji: String(product.emoji || "💐")
      }
    });

    return NextResponse.json(mapProduct(updatedProduct));
  });
}

export async function DELETE(request: Request, { params }: ProductRouteProps) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const { slug } = await params;
    await prisma.product.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  });
}
