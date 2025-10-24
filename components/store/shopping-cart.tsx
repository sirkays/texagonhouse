"use client"

import { useCart } from "@/lib/hooks/use-cart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"

export function ShoppingCart() {
  const { cart, updateQuantity, removeItem, isLoading, error } = useCart()

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading cart: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const items = cart?.items || []
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/store">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link href="/store/checkout" className="block">
              <Button className="w-full">Proceed to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
