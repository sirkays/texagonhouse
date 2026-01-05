"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ProductDetail} from "@/components/store/product-detail";
import {useRouter, useParams} from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/store/products/${slug}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          if (res.status === 404) {
            setError("Product not found");
            return;
          }
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
      // texagon_academy\texagonui\app\store\product\page.tsx

      setProduct({
        id: data.id,
        name: data.title,
        description: data.description,
        price: parseFloat(data.price),
        type: data.type,
        category: data.category,
        rating: data.rating,
        ratingCount: data.rating_count,     // ✅ keep count separately
        image: data.image,
        images: data.images || [],          // ✅ include gallery images
        reviews: data.reviews || [],        // ✅ include reviews array
        bnplAvailable: data.bnpl_enabled,
        stock: data.stock,
      });

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, router]);

  if (loading)
    return <div className="text-center py-10">Loading product...</div>;
  if (error)
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <Link href="/store" className="text-blue-600 underline">
          Back to Store
        </Link>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Link href="/store" className="text-blue-600 underline mb-4 inline-block">
        &larr; Back to Store ...
      </Link>
      <ProductDetail product={product} />
    </div>
  );
}
