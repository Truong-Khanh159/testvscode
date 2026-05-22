import { NextResponse } from "next/server";
import { badRequestResponse, withAdmin } from "@/lib/server/http";
import { mapProduct, seedProductsIfEmpty } from "@/lib/server/products";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/auth";
import { requireCsrf } from "@/lib/server/security";

export const runtime = "nodejs";

export async function GET() {
  await seedProductsIfEmpty();
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products.map(mapProduct));
}

export async function POST(request: Request) {
  return withAdmin(async () => {
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    await requireAdmin();
    const product = await request.json();

    if (!product.slug || !product.name || !product.category || !product.description) {
      return badRequestResponse("Thiếu thông tin sản phẩm bắt buộc");
    }

    const createdProduct = await prisma.product.create({
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

    return NextResponse.json(mapProduct(createdProduct), { status: 201 });
  });
}
