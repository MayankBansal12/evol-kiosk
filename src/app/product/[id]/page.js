import { notFound } from "next/navigation";
import { ProductDetailsPage } from "@/components/ProductDetailsPage";
import { findProductById } from "@/lib/productHelpers";

export default async function ProductPage({ params }) {
  const { id } = await params;
  
  // Find the product by ID
  const product = findProductById(id);
  
  if (!product) {
    notFound();
  }

  return <ProductDetailsPage product={product} />;
}

// Generate static params for all products (optional, for better performance)
export async function generateStaticParams() {
  // This would be used for static generation if needed
  // For now, we'll use dynamic rendering
  return [];
}

// Enable dynamic rendering
export const dynamic = "force-dynamic";
