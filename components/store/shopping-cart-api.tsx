// "use client"

// import { useCart } from "@/lib/hooks/use-cart"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Plus, Minus, Trash2 } from "lucide-react"

// export function ShoppingCartAPI() {
//   const { cart, updateCartItem, removeFromCart } = useCart()

//   if (!cart) {
//     return <div className="text-center py-8">Loading cart...</div>
//   }

//   const items = cart.items || []
//   const subtotal = Number.parseFloat(cart.subtotal || "0")

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Shopping Cart</h2>

//       {items.length === 0 ? (
//         <Card>
//           <CardContent className="py-8 text-center">
//             <p className="text-gray-600">Your cart is empty</p>
//           </CardContent>
//         </Card>
//       ) : (
//         <>
//           <div className="space-y-3">
//             {items.map((item: any) => (
//               <Card key={item.id}>
//                 <CardContent className="pt-6">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <h3 className="font-semibold">{item.title}</h3>
//                       <p className="text-sm text-gray-600">${item.price}</p>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Button variant="outline" size="icon" onClick={() => updateCartItem(item.id, item.quantity - 1)}>
//                         <Minus className="h-4 w-4" />
//                       </Button>
//                       <span className="w-8 text-center">{item.quantity}</span>
//                       <Button variant="outline" size="icon" onClick={() => updateCartItem(item.id, item.quantity + 1)}>
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
//                         <Trash2 className="h-4 w-4 text-red-600" />
//                       </Button>
//                     </div>
//                   </div>
//                   <p className="text-right font-semibold mt-2">${item.line_total}</p>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Order Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div className="flex justify-between">
//                 <span>Subtotal</span>
//                 <span>${subtotal.toFixed(2)}</span>
//               </div>
//               {cart.coupon && (
//                 <div className="flex justify-between text-green-600">
//                   <span>Coupon Applied</span>
//                   <Badge>{cart.coupon}</Badge>
//                 </div>
//               )}
//               <div className="border-t pt-2 flex justify-between font-bold">
//                 <span>Total</span>
//                 <span>${subtotal.toFixed(2)}</span>
//               </div>
//               <Button className="w-full mt-4">Proceed to Checkout</Button>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   )
// }

// components/store/shopping-cart-api.tsx
"use client";

import {useCart} from "@/lib/hooks/use-cart";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Plus, Minus, Trash2} from "lucide-react";
import {Input} from "../ui/input";
import {useState} from "react";

export function ShoppingCartAPI() {
  const {cart, updateCartItem, removeFromCart, applyCoupon} = useCart();
  const [couponCode, setCouponCode] = useState("");

  if (!cart) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  const items = cart.items || [];
  const subtotal = Number.parseFloat(cart.subtotal || "0");

  const handleApplyCoupon = async () => {
    await applyCoupon(couponCode);
    setCouponCode("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Shopping Cart</h2>
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-600">Your cart is empty</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity - 1)
                        }>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity + 1)
                        }>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-right font-semibold mt-2">
                    ${item.line_total}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleApplyCoupon} className="w-full">
              Apply Coupon
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {cart.coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Applied</span>
                  <Badge>{cart.coupon}</Badge>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-4">Proceed to Checkout</Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
