import type { MetadataRoute } from "next";
import { products } from "@/lib/products";

const baseUrl = "https://bloome.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/cart", "/checkout"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  return [...staticRoutes, ...productRoutes];
}
