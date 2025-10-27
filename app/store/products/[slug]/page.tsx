"use client";

import React, {useEffect, useState} from "react";
import Link from "next/link";
import {ProductDetail} from "@/components/store/product-detail"; // ensure this is a client component

interface BackendProduct {
  id: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  price: string;
  rating: number;
  rating_count: number;
  image: string | null;
  bnpl_enabled: boolean;
  description: string;
}

interface UiProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  type?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  bnplAvailable?: boolean;
}

export default function ProductPage({params}: {params: {slug: string}}) {
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/store/products/${params.slug}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.statusText}`);
        }

        const data: BackendProduct = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, []);
  // }, [params.slug]);

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/store" className="text-blue-600 underline">
          Back to Store
        </Link>
      </div>
    );
  }

  // 🧩 Map backend data to UI format
  const uiProduct: UiProduct = {
    id: product.id,
    name: product.title,
    description: product.description,
    price: parseFloat(product.price),
    category: product.category,
    type: product.type,
    rating: product.rating,
    reviews: product.rating_count,
    image: product.image ?? undefined,
    bnplAvailable: product.bnpl_enabled,
  };

  // ✅ Return final product detail view
  return (
    <div className="container mx-auto flex justify-center p-10">
      <Link href="/store" className="text-blue-600 underline">
        Back to Store
      </Link>
      <ProductDetail product={uiProduct} />
    </div>
  );
}
