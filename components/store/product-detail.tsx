// // components/store/product-detail.tsx
// "use client";

// import {Button} from "@/components/ui/button";
// import {Star} from "lucide-react";
// import {toast} from "sonner";
// import {useCart} from "@/providers/CartProvider";
// import {useRouter} from "next/navigation";

// export function ProductDetail({product}: {product: any}) {
//   const {addToCart, setBuyNowProduct} = useCart();
//   const router = useRouter();

//   const handleAddToCart = () => {
//     addToCart(product);
//     toast.success("Added to cart");
//   };

//   const handleBuyNow = () => {
//     setBuyNowProduct({...product, quantity: 1});
//     router.push("/store/checkout");
//   };

//   return (
//     <div className="grid md:grid-cols-2 gap-8">
//       <img
//         src={product.image || "/placeholder.svg"}
//         alt={product.name}
//         className="w-full rounded-lg object-cover"
//       />
//       <div className="space-y-4">
//         <h1 className="text-3xl font-bold">{product.name}</h1>
//         <div className="flex items-center gap-2">
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               className={
//                 i < Math.floor(product.rating)
//                   ? "fill-yellow-400 text-yellow-400"
//                   : "text-gray-300"
//               }
//             />
//           ))}
//           <span>({product.reviews})</span>
//         </div>
//         <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
//         <p>{product.description}</p>
//         <div className="flex gap-4">
//           <Button onClick={handleAddToCart}>Add to Cart</Button>
//           <Button onClick={handleBuyNow} variant="outline">
//             Buy Now
//           </Button>
//         </div>
//         {product.bnplAvailable && <p>BNPL available: Yes</p>}
//         {/* Add more details based on type */}
//       </div>
//     </div>
//   );
// }

// components/store/product-detail.tsx
"use client";

import {Button} from "@/components/ui/button";
import {Star} from "lucide-react";
import {toast} from "sonner";
import {useCart} from "@/providers/CartProvider";
import {useRouter} from "next/navigation";

export function ProductDetail({product}: {product: any}) {
  const {addToCart, setBuyNowProduct} = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    setBuyNowProduct({...product, quantity: 1});
    router.push("/store/checkout");
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto p-4 md:p-0">
        <div className="relative overflow-hidden rounded-xl shadow-md">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
            <span>({product.reviews} reviews)</span>
          </div>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="flex gap-4">
            <Button onClick={handleAddToCart} size="lg">
              Add to Cart
            </Button>
            <Button onClick={handleBuyNow} variant="outline" size="lg">
              Buy Now
            </Button>
          </div>
          {product.bnplAvailable && (
            <p className="text-sm font-medium text-green-600">BNPL available</p>
          )}
          {/* Add more details based on type */}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => router.push("/store?tab=cart")}
          className="rounded-full shadow-lg"
          size="lg">
          Cart
        </Button>
      </div>
    </>
  );
}
