// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/lib/hooks/use-cart"
// import { useAddresses } from "@/lib/hooks/use-addresses"
// import { useBNPLPlans } from "@/lib/hooks/use-bnpl"
// import { createOrder, processPayment } from "@/lib/hooks/use-checkout"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { ArrowLeft, CreditCard, Loader2 } from "lucide-react"
// import { toast } from "sonner"

// export default function CheckoutPage() {
//   const router = useRouter()
//   const { cart } = useCart()
//   const { addresses } = useAddresses()
//   const { plans } = useBNPLPlans()
//   const [isProcessing, setIsProcessing] = useState(false)

//   const [formData, setFormData] = useState({
//     email: "",
//     firstName: "",
//     lastName: "",
//     address: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "US",
//     cardNumber: "",
//     cardName: "",
//     expiryDate: "",
//     cvv: "",
//   })

//   const items = cart?.items || []
//   const subtotal = Number.parseFloat(cart?.subtotal || "0")
//   const shipping = items.some((item: any) => item.type === "physical") ? 9.99 : 0
//   const tax = subtotal * 0.08
//   const total = subtotal + shipping + tax

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.email || !formData.firstName || !formData.address) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     try {
//       setIsProcessing(true)
//       console.log("[v0] Starting checkout process...")

//       // Create order
//       const shippingData = {
//         email: formData.email,
//         first_name: formData.firstName,
//         last_name: formData.lastName,
//         address: formData.address,
//         city: formData.city,
//         state: formData.state,
//         zip_code: formData.zipCode,
//         country: formData.country,
//       }

//       const paymentData = {
//         card_number: formData.cardNumber,
//         cardholder_name: formData.cardName,
//         expiry_date: formData.expiryDate,
//         cvv: formData.cvv,
//       }

//       console.log("[v0] Creating order...")
//       const order = await createOrder(cart.id, shippingData, paymentData)
//       console.log("[v0] Order created:", order)

//       if (!order.id) {
//         throw new Error("Failed to create order")
//       }

//       console.log("[v0] Processing payment...")
//       const payment = await processPayment(order.id, paymentData)
//       console.log("[v0] Payment processed:", payment)

//       toast.success("Order placed successfully!")
//       console.log("[v0] Redirecting to orders page...")
//       setTimeout(() => router.push("/store?tab=orders"), 2000)
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to place order"
//       console.error("[v0] Checkout error:", errorMessage)
//       toast.error(errorMessage)
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   if (items.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600 mb-4">Your cart is empty</p>
//           <Button onClick={() => router.push("/store")}>Continue Shopping</Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto px-4 py-8">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <Button variant="outline" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold">Checkout</h1>
//             <p className="text-muted-foreground">Complete your purchase</p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Checkout Form */}
//           <div className="lg:col-span-2 space-y-6">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Contact Information */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Contact Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <Label htmlFor="email">Email *</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Shipping Information */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Shipping Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="firstName">First Name *</Label>
//                       <Input
//                         id="firstName"
//                         value={formData.firstName}
//                         onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={formData.lastName}
//                         onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label htmlFor="address">Address *</Label>
//                     <Input
//                       id="address"
//                       value={formData.address}
//                       onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <Label htmlFor="city">City</Label>
//                       <Input
//                         id="city"
//                         value={formData.city}
//                         onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="state">State</Label>
//                       <Input
//                         id="state"
//                         value={formData.state}
//                         onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="zipCode">ZIP Code</Label>
//                       <Input
//                         id="zipCode"
//                         value={formData.zipCode}
//                         onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Payment Information */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <CreditCard className="h-5 w-5" />
//                     Payment Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <Label htmlFor="cardNumber">Card Number</Label>
//                     <Input
//                       id="cardNumber"
//                       placeholder="1234 5678 9012 3456"
//                       value={formData.cardNumber}
//                       onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="cardName">Cardholder Name</Label>
//                     <Input
//                       id="cardName"
//                       value={formData.cardName}
//                       onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="expiryDate">Expiry Date</Label>
//                       <Input
//                         id="expiryDate"
//                         placeholder="MM/YY"
//                         value={formData.expiryDate}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             expiryDate: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="cvv">CVV</Label>
//                       <Input
//                         id="cvv"
//                         placeholder="123"
//                         value={formData.cvv}
//                         onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
//                         required
//                       />
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* BNPL Options */}
//               {plans && plans.length > 0 && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Buy Now, Pay Later</CardTitle>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     {plans.map((plan: any) => (
//                       <div key={plan.id} className="border rounded-lg p-3">
//                         <p className="font-semibold">{plan.name}</p>
//                         <p className="text-sm text-gray-600">
//                           {plan.installments} payments of ${(total / plan.installments).toFixed(2)}
//                         </p>
//                         <Button
//                           type="button"
//                           variant="outline"
//                           className="w-full mt-2 bg-transparent"
//                           disabled={isProcessing}
//                         >
//                           Select {plan.name}
//                         </Button>
//                       </div>
//                     ))}
//                   </CardContent>
//                 </Card>
//               )}

//               <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
//                 {isProcessing ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Processing...
//                   </>
//                 ) : (
//                   `Place Order - $${total.toFixed(2)}`
//                 )}
//               </Button>
//             </form>
//           </div>

//           {/* Order Summary */}
//           <div>
//             <Card className="sticky top-4">
//               <CardHeader>
//                 <CardTitle>Order Summary</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {items.map((item: any) => (
//                     <div key={item.id} className="flex justify-between text-sm">
//                       <span className="line-clamp-2">{item.title}</span>
//                       <span className="font-semibold">${item.line_total}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <Separator />

//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span>Subtotal</span>
//                     <span>${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Shipping</span>
//                     <span>{shipping === 0 ? <Badge variant="secondary">FREE</Badge> : `$${shipping.toFixed(2)}`}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Tax</span>
//                     <span>${tax.toFixed(2)}</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between font-bold text-base">
//                     <span>Total</span>
//                     <span>${total.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client";

import type React from "react";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {useCart} from "@/lib/hooks/use-cart";
import {useAddresses} from "@/lib/hooks/use-addresses";
import {useBNPLPlans} from "@/lib/hooks/use-bnpl";
import {createOrder, processPayment} from "@/lib/hooks/use-checkout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Badge} from "@/components/ui/badge";
import {Separator} from "@/components/ui/separator";
import {ArrowLeft, CreditCard, Loader2} from "lucide-react";
import {toast} from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const {cart} = useCart();
  const {addresses, createAddress} = useAddresses();
  const {plans} = useBNPLPlans();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const items = cart?.items || [];
  const subtotal = Number.parseFloat(cart?.subtotal || "0");
  const shipping = items.some((item: any) => item.type === "physical")
    ? 9.99
    : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsProcessing(true);
      console.log("[v0] Starting checkout process...");

      // Create or select address
      let addressId = selectedAddressId;
      if (!addressId) {
        const newAddress = await createAddress({
          full_name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country,
        });
        addressId = newAddress.id;
      }

      const shippingData = {addressId};
      const paymentData = {
        card_number: formData.cardNumber,
        cardholder_name: formData.cardName,
        expiry_date: formData.expiryDate,
        cvv: formData.cvv,
      };

      console.log("[v0] Creating order...");
      const order = await createOrder(cart.id, shippingData, paymentData);
      console.log("[v0] Order created:", order);

      if (!order.id) {
        throw new Error("Failed to create order");
      }

      toast.success("Order placed successfully!");
      console.log("[v0] Redirecting to orders page...");
      setTimeout(() => router.push("/store?tab=orders"), 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to place order";
      console.error("[v0] Checkout error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/store")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({...formData, email: e.target.value})
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <select
                    value={selectedAddressId || ""}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full p-2 border rounded">
                    <option value="">
                      Select an existing address or create new
                    </option>
                    {addresses.map((addr: any) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.full_name}, {addr.line1}, {addr.city}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({...formData, firstName: e.target.value})
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({...formData, lastName: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({...formData, address: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({...formData, city: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({...formData, state: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({...formData, zipCode: e.target.value})
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) =>
                        setFormData({...formData, cardNumber: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) =>
                        setFormData({...formData, cardName: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({...formData, expiryDate: e.target.value})
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) =>
                          setFormData({...formData, cvv: e.target.value})
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {plans && plans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Buy Now, Pay Later</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plans.map((plan: any) => (
                      <div key={plan.id} className="border rounded-lg p-3">
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-sm text-gray-600">
                          {plan.num_installments} payments of $
                          {(total / plan.num_installments).toFixed(2)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-2 bg-transparent"
                          disabled={isProcessing}>
                          Select {plan.name}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Place Order - $${total.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-2">{item.title}</span>
                      <span className="font-semibold">${item.line_total}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="secondary">FREE</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
