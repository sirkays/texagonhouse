// "use client";

// import type React from "react";

// import {useState} from "react";
// import {useRouter} from "next/navigation";
// import DashboardLayout from "@/app/admin/layout";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {Button} from "@/components/ui/button";
// import {Input} from "@/components/ui/input";
// import {Label} from "@/components/ui/label";
// import {Separator} from "@/components/ui/separator";
// import {Badge} from "@/components/ui/badge";
// import {ArrowLeft, CreditCard, Trash2, ShoppingBag} from "lucide-react";
// import {useToast} from "@/hooks/use-toast";
// import {useCart} from "@/providers/CartProvider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// export default function CheckoutPage() {
//   const router = useRouter();
//   const {toast} = useToast();
//   const {
//     cartItems,
//     updateQuantity,
//     removeFromCart,
//     buyNowProduct,
//     setBuyNowProduct,
//   } = useCart();
//   const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;

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
//   });

//   const subtotal = displayItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );
//   const shipping = displayItems.some((item) => item.type === "physical")
//     ? 9.99
//     : 0;
//   const tax = subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   const handleRemoveItem = (id: number) => {
//     if (buyNowProduct && buyNowProduct.id === id) {
//       setBuyNowProduct(null);
//     } else {
//       removeFromCart(id);
//     }
//     toast({title: "Item Removed", description: "Item removed from cart"});
//   };

//   const handleQuantityChange = (id: number, newQuantity: number) => {
//     if (newQuantity < 1) return;
//     if (buyNowProduct && buyNowProduct.id === id) {
//       setBuyNowProduct({...buyNowProduct, quantity: newQuantity});
//     } else {
//       updateQuantity(id, newQuantity);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     toast({
//       title: "Order Placed Successfully!",
//       description: `Your order of $${total.toFixed(2)} has been confirmed.`,
//     });
//     setTimeout(() => router.push("/store"), 2000);
//   };

//   return (
//     <>
//       <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <Button variant="outline" size="icon" onClick={() => router.back()}>
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
//               Checkout
//             </h1>
//             <p className="text-sm md:text-base text-muted-foreground mt-1">
//               Complete your purchase
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
//           {/* Checkout Form */}
//           <div className="lg:col-span-2 space-y-4 md:space-y-6">
//             {/* Contact Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Contact Information</CardTitle>
//                 <CardDescription>
//                   We'll use this to send order confirmations
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email Address</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="you@example.com"
//                       value={formData.email}
//                       onChange={(e) =>
//                         setFormData({...formData, email: e.target.value})
//                       }
//                       required
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Shipping Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Shipping Information</CardTitle>
//                 <CardDescription>
//                   Where should we deliver your order?
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="firstName">First Name</Label>
//                       <Input
//                         id="firstName"
//                         value={formData.firstName}
//                         onChange={(e) =>
//                           setFormData({...formData, firstName: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="lastName">Last Name</Label>
//                       <Input
//                         id="lastName"
//                         value={formData.lastName}
//                         onChange={(e) =>
//                           setFormData({...formData, lastName: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="address">Street Address</Label>
//                     <Input
//                       id="address"
//                       value={formData.address}
//                       onChange={(e) =>
//                         setFormData({...formData, address: e.target.value})
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="city">City</Label>
//                       <Input
//                         id="city"
//                         value={formData.city}
//                         onChange={(e) =>
//                           setFormData({...formData, city: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="state">State</Label>
//                       <Input
//                         id="state"
//                         value={formData.state}
//                         onChange={(e) =>
//                           setFormData({...formData, state: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="zipCode">ZIP Code</Label>
//                       <Input
//                         id="zipCode"
//                         value={formData.zipCode}
//                         onChange={(e) =>
//                           setFormData({...formData, zipCode: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="country">Country</Label>
//                     <Select
//                       value={formData.country}
//                       onValueChange={(value) =>
//                         setFormData({...formData, country: value})
//                       }>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="US">United States</SelectItem>
//                         <SelectItem value="CA">Canada</SelectItem>
//                         <SelectItem value="UK">United Kingdom</SelectItem>
//                         <SelectItem value="AU">Australia</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>

//             {/* Payment Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <CreditCard className="h-5 w-5" />
//                   Payment Information
//                 </CardTitle>
//                 <CardDescription>
//                   Enter your payment details securely
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="cardNumber">Card Number</Label>
//                     <Input
//                       id="cardNumber"
//                       placeholder="1234 5678 9012 3456"
//                       value={formData.cardNumber}
//                       onChange={(e) =>
//                         setFormData({...formData, cardNumber: e.target.value})
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="cardName">Cardholder Name</Label>
//                     <Input
//                       id="cardName"
//                       placeholder="Name on card"
//                       value={formData.cardName}
//                       onChange={(e) =>
//                         setFormData({...formData, cardName: e.target.value})
//                       }
//                       required
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="expiryDate">Expiry Date</Label>
//                       <Input
//                         id="expiryDate"
//                         placeholder="MM/YY"
//                         value={formData.expiryDate}
//                         onChange={(e) =>
//                           setFormData({...formData, expiryDate: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="cvv">CVV</Label>
//                       <Input
//                         id="cvv"
//                         placeholder="123"
//                         value={formData.cvv}
//                         onChange={(e) =>
//                           setFormData({...formData, cvv: e.target.value})
//                         }
//                         required
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <Card className="sticky top-4">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <ShoppingBag className="h-5 w-5" />
//                   Order Summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Cart Items */}
//                 <div className="space-y-3 max-h-[300px] overflow-y-auto">
//                   {displayItems.map((item) => (
//                     <div
//                       key={item.id}
//                       className="flex gap-3 p-3 border rounded-lg">
//                       <img
//                         src={item.image || "/placeholder.svg"}
//                         alt={item.name}
//                         className="w-16 h-16 rounded object-cover flex-shrink-0"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <h4 className="font-medium text-sm line-clamp-2">
//                           {item.name}
//                         </h4>
//                         <div className="flex items-center gap-2 mt-2">
//                           <div className="flex items-center gap-1">
//                             <Button
//                               variant="outline"
//                               size="icon"
//                               className="h-6 w-6 bg-transparent"
//                               onClick={() =>
//                                 handleQuantityChange(item.id, item.quantity - 1)
//                               }>
//                               -
//                             </Button>
//                             <span className="text-sm w-8 text-center">
//                               {item.quantity}
//                             </span>
//                             <Button
//                               variant="outline"
//                               size="icon"
//                               className="h-6 w-6 bg-transparent"
//                               onClick={() =>
//                                 handleQuantityChange(item.id, item.quantity + 1)
//                               }>
//                               +
//                             </Button>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-6 w-6 ml-auto"
//                             onClick={() => handleRemoveItem(item.id)}>
//                             <Trash2 className="h-3 w-3 text-destructive" />
//                           </Button>
//                         </div>
//                         <p className="text-sm font-semibold mt-1">
//                           ${(item.price * item.quantity).toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <Separator />

//                 {/* Price Breakdown */}
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Subtotal</span>
//                     <span className="font-medium">${subtotal.toFixed(2)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Shipping</span>
//                     <span className="font-medium">
//                       {shipping === 0 ? (
//                         <Badge variant="secondary" className="text-xs">
//                           FREE
//                         </Badge>
//                       ) : (
//                         `$${shipping.toFixed(2)}`
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Tax (8%)</span>
//                     <span className="font-medium">${tax.toFixed(2)}</span>
//                   </div>
//                   <Separator />
//                   <div className="flex justify-between text-base font-bold">
//                     <span>Total</span>
//                     <span>${total.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 <Button className="w-full" size="lg" onClick={handleSubmit}>
//                   Place Order - ${total.toFixed(2)}
//                 </Button>

//                 <p className="text-xs text-muted-foreground text-center">
//                   By placing your order, you agree to our terms and conditions
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import type React from "react";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {Badge} from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Trash2,
  ShoppingBag,
  Edit,
  X,
} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {useCart} from "@/providers/CartProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

interface Address {
  id: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {toast} = useToast();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    buyNowProduct,
    setBuyNowProduct,
    clearCart,
  } = useCart();
  const displayItems = buyNowProduct ? [buyNowProduct] : cartItems;

  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(
    null
  );
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
    phone: "",
  });
  const [needsShipping, setNeedsShipping] = useState(false);

  const subtotal = displayItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = needsShipping ? 9.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const fetchAddresses = async () => {
      const res = await fetch("/api/store/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.results);
      }
    };
    fetchAddresses();
    setNeedsShipping(displayItems.some((item) => item.type === "physical"));
  }, [displayItems]);

  const handleRemoveItem = (id: number) => {
    if (buyNowProduct && buyNowProduct.id === id) {
      setBuyNowProduct(null);
    } else {
      removeFromCart(id);
    }
    toast({title: "Item Removed", description: "Item removed from cart"});
  };

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (buyNowProduct && buyNowProduct.id === id) {
      setBuyNowProduct({...buyNowProduct, quantity: newQuantity});
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const refetchAddresses = async () => {
    const res = await fetch("/api/store/addresses");
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.results);
    }
  };

  const handleSaveAddress = async () => {
    const body = {
      full_name: addressForm.full_name,
      line1: addressForm.line1,
      line2: addressForm.line2,
      city: addressForm.city,
      state: addressForm.state,
      postal_code: addressForm.postal_code,
      country: addressForm.country,
      phone: addressForm.phone,
      is_default: false, // assume
    };

    let res;
    if ("id" in editingAddress && editingAddress.id) {
      res = await fetch(`/api/store/addresses/${editingAddress.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch("/api/store/addresses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
      });
    }

    if (res.ok) {
      const data = await res.json();
      await refetchAddresses();
      setEditingAddress(null);
      setSelectedAddress("id" in editingAddress ? editingAddress.id : data.id);
      toast({title: "Address Saved", description: "Address has been updated"});
    } else {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      const res = await fetch(`/api/store/addresses/${id}`, {method: "DELETE"});
      if (res.ok) {
        await refetchAddresses();
        if (selectedAddress === id) setSelectedAddress(null);
        toast({
          title: "Address Deleted",
          description: "Address has been removed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete address",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      full_name: address.full_name,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone,
    });
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
      phone: "",
    });
  };

  const handleAddNewAddress = () => {
    setEditingAddress({});
    setAddressForm({
      full_name: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
      phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsShipping && !selectedAddress) {
      toast({
        title: "Error",
        description: "Please select a shipping address",
        variant: "destructive",
      });
      return;
    }

    const items = displayItems.map((item) => ({
      product: item.id,
      quantity: item.quantity,
    }));

    const orderBody: any = {items};
    if (needsShipping) {
      orderBody.address = selectedAddress;
    }
    if (formData.email) {
      orderBody.billing_email = formData.email;
    }

    const orderRes = await fetch("/api/store/checkout/create-order", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(orderBody),
    });

    if (!orderRes.ok) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
      return;
    }

    const orderData = await orderRes.json();
    const orderId = orderData.order_id;

    const paymentBody = {
      card_number: formData.cardNumber.replace(/\s/g, ""),
      name: formData.cardName,
      expiry: formData.expiryDate,
      cvv: formData.cvv,
    };

    const paymentRes = await fetch(
      `/api/store/payments/card/${orderId}/start`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(paymentBody),
      }
    );

    if (!paymentRes.ok) {
      toast({
        title: "Error",
        description: "Failed to start payment",
        variant: "destructive",
      });
      return;
    }

    const paymentData = await paymentRes.json();
    const paymentId = paymentData.payment_id;

    const captureRes = await fetch(
      `/api/store/payments/${paymentId}/mark-captured`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({}),
      }
    );

    if (captureRes.ok) {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order of $${total.toFixed(2)} has been confirmed.`,
      });
      if (buyNowProduct) {
        setBuyNowProduct(null);
      } else {
        clearCart();
      }
      setTimeout(() => router.push("/store"), 2000);
    } else {
      toast({
        title: "Error",
        description: "Failed to capture payment",
        variant: "destructive",
      });
    }
  };

  const updateAddressForm = (field: string, value: string) => {
    setAddressForm((prev) => ({...prev, [field]: value}));
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Checkout
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Complete your purchase
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                We'll use this to send order confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({...formData, email: e.target.value})
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>
                {needsShipping
                  ? "Where should we deliver your order?"
                  : "No shipping required for digital items"}
              </CardDescription>
            </CardHeader>
            {needsShipping && (
              <CardContent>
                {editingAddress ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={addressForm.full_name}
                        onChange={(e) =>
                          updateAddressForm("full_name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line1">Address Line 1</Label>
                      <Input
                        id="line1"
                        value={addressForm.line1}
                        onChange={(e) =>
                          updateAddressForm("line1", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2">Address Line 2 (optional)</Label>
                      <Input
                        id="line2"
                        value={addressForm.line2}
                        onChange={(e) =>
                          updateAddressForm("line2", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) =>
                            updateAddressForm("city", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) =>
                            updateAddressForm("state", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">ZIP Code</Label>
                        <Input
                          id="postal_code"
                          value={addressForm.postal_code}
                          onChange={(e) =>
                            updateAddressForm("postal_code", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={addressForm.country}
                        onValueChange={(value) =>
                          updateAddressForm("country", value)
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          updateAddressForm("phone", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveAddress}>Save Address</Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RadioGroup
                      value={selectedAddress || undefined}
                      onValueChange={setSelectedAddress}>
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <RadioGroupItem value={addr.id} id={addr.id} />
                            <div>
                              <p className="font-medium">{addr.full_name}</p>
                              <p>
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""}
                              </p>
                              <p>
                                {addr.city}, {addr.state} {addr.postal_code}
                              </p>
                              <p>{addr.country}</p>
                              {addr.phone && <p>Phone: {addr.phone}</p>}
                              {addr.is_default && <Badge>Default</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditAddress(addr)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAddress(addr.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button variant="outline" onClick={handleAddNewAddress}>
                      Add New Address
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Enter your payment details securely
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="Name on card"
                    value={formData.cardName}
                    onChange={(e) =>
                      setFormData({...formData, cardName: e.target.value})
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }>
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 bg-transparent"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }>
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => handleRemoveItem(item.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        FREE
                      </Badge>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit}>
                Place Order - ${total.toFixed(2)}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our terms and conditions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
