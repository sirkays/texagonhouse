// "use client"

// import { useProductDetail } from "@/lib/hooks/use-catalog"
// import { useCart } from "@/lib/hooks/use-cart"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Star, ArrowLeft, ShoppingCart } from "lucide-react"
// import { toast } from "sonner"
// import { useState } from "react"

// export default function ProductDetailPage({
//   params,
// }: {
//   params: { productId: string }
// }) {
//   const router = useRouter()
//   const { product, isLoading, error } = useProductDetail(params.productId)
//   const { addToCart } = useCart()
//   const [quantity, setQuantity] = useState(1)
//   const [isAdding, setIsAdding] = useState(false)

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p>Loading product...</p>
//       </div>
//     )
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">Product not found</p>
//           <Button onClick={() => router.back()}>Go Back</Button>
//         </div>
//       </div>
//     )
//   }

//   const handleAddToCart = async () => {
//     try {
//       setIsAdding(true)
//       await addToCart(product.id, quantity)
//       toast.success(`Added ${quantity} item(s) to cart!`)
//     } catch (error) {
//       toast.error("Failed to add to cart")
//     } finally {
//       setIsAdding(false)
//     }
//   }

//   const handleBuyNow = async () => {
//     try {
//       setIsAdding(true)
//       await addToCart(product.id, quantity)
//       router.push("/store/checkout")
//     } catch (error) {
//       toast.error("Failed to proceed")
//     } finally {
//       setIsAdding(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         {/* Back Button */}
//         <Button variant="outline" onClick={() => router.back()} className="mb-6">
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Product Image */}
//           <div>
//             <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full rounded-lg border" />
//           </div>

//           {/* Product Details */}
//           <div className="space-y-6">
//             <div>
//               <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
//               <p className="text-muted-foreground">{product.description}</p>
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-2">
//               <div className="flex">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Star
//                     key={i}
//                     className={`h-5 w-5 ${
//                       i < Math.floor(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
//                     }`}
//                   />
//                 ))}
//               </div>
//               <span className="text-sm text-gray-600">
//                 {product.rating} ({product.rating_count} reviews)
//               </span>
//             </div>

//             {/* Price */}
//             <div className="space-y-2">
//               <div className="flex items-baseline gap-2">
//                 <span className="text-4xl font-bold">${product.price}</span>
//                 {product.original_price && (
//                   <span className="text-lg text-gray-500 line-through">${product.original_price}</span>
//                 )}
//               </div>
//               {product.bnpl_enabled && (
//                 <p className="text-sm text-green-600">or 4 payments of ${(product.price / 4).toFixed(2)} with BNPL</p>
//               )}
//             </div>

//             {/* Product Info */}
//             <div className="space-y-2">
//               <div className="flex gap-2">
//                 <Badge>{product.type}</Badge>
//                 {product.bnpl_enabled && <Badge variant="secondary">BNPL Available</Badge>}
//               </div>
//             </div>

//             {/* Quantity Selector */}
//             <div className="flex items-center gap-4">
//               <span className="font-semibold">Quantity:</span>
//               <div className="flex items-center border rounded">
//                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100">
//                   −
//                 </button>
//                 <span className="px-4 py-2 font-semibold">{quantity}</span>
//                 <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-100">
//                   +
//                 </button>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={isAdding}>
//                 Buy Now
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="flex-1 bg-transparent"
//                 onClick={handleAddToCart}
//                 disabled={isAdding}
//               >
//                 <ShoppingCart className="mr-2 h-4 w-4" />
//                 Add to Cart
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client";

import {useProductDetail} from "@/lib/hooks/use-catalog";
import {useCart} from "@/lib/hooks/use-cart";
import {useReviews} from "@/lib/hooks/use-reviews";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Star, ArrowLeft, ShoppingCart} from "lucide-react";
import {toast} from "sonner";
import {useState} from "react";
import {Input} from "@/components/ui/input";

export default function ProductDetailPage({
  params,
}: {
  params: {productId: string};
}) {
  const router = useRouter();
  const {product, isLoading, error} = useProductDetail(params.productId);
  const {addToCart} = useCart();
  const {submitReview, isLoading: isSubmitting} = useReviews(params.productId);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [review, setReview] = useState({rating: 0, title: "", body: ""});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Product not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product.id, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsAdding(true);
      await addToCart(product.id, quantity);
      router.push("/store/checkout");
    } catch (error) {
      toast.error("Failed to proceed");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (review.rating && review.title && review.body) {
      await submitReview(review);
      toast.success("Review submitted!");
      setReview({rating: 0, title: "", body: ""});
    } else {
      toast.error("Please fill all review fields");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="w-full rounded-lg border"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({length: 5}).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.rating_count} reviews)
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">${product.price}</span>
              </div>
              {product.bnpl_enabled && (
                <p className="text-sm text-green-600">
                  or 4 payments of ${(product.price / 4).toFixed(2)} with BNPL
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge>{product.type}</Badge>
                {product.bnpl_enabled && (
                  <Badge variant="secondary">BNPL Available</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100">
                  −
                </button>
                <span className="px-4 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100">
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
                disabled={isAdding}>
                Buy Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={handleAddToCart}
                disabled={isAdding}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            {/* Review Form */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <Input
                  type="number"
                  min="0"
                  max="5"
                  placeholder="Rating (0-5)"
                  value={review.rating}
                  onChange={(e) =>
                    setReview({...review, rating: Number(e.target.value)})
                  }
                />
                <Input
                  placeholder="Review Title"
                  value={review.title}
                  onChange={(e) =>
                    setReview({...review, title: e.target.value})
                  }
                />
                <Input
                  placeholder="Review Body"
                  value={review.body}
                  onChange={(e) => setReview({...review, body: e.target.value})}
                />
                <Button type="submit" disabled={isSubmitting}>
                  Submit Review
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
