import type { Product } from "@/lib/products";
import { products as defaultProducts } from "@/lib/products";
import { prisma } from "./prisma";

type DbProduct = {
  slug: string;
  name: string;
  price: number;
  category: string;
  description: string;
  details: unknown;
  imageUrl: string | null;
  palette: string;
  emoji: string;
};

export function mapProduct(product: DbProduct): Product {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    category: product.category,
    description: product.description,
    details: Array.isArray(product.details) ? product.details.map(String) : [],
    imageUrl: product.imageUrl,
    palette: product.palette,
    emoji: product.emoji
  };
}

export async function seedProductsIfEmpty() {
  const count = await prisma.product.count();
  if (count > 0) {
    return;
  }

  await prisma.product.createMany({
    data: defaultProducts.map((product) => ({
      slug: product.slug,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      details: product.details,
      imageUrl: product.imageUrl,
      palette: product.palette,
      emoji: product.emoji
    }))
  });
}
