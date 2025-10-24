"use client"

import { useOrders } from "@/lib/hooks/use-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, Download } from "lucide-react"

export function OrderManagement() {
  const { orders, isLoading, error } = useOrders()

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading orders: {error}</p>
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

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No orders yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order #{order.id}</CardTitle>
                <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
              </div>
              <Badge
                variant={
                  order.status === "completed" ? "default" : order.status === "pending" ? "secondary" : "destructive"
                }
              >
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold">${order.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Items</p>
                <p className="text-lg font-semibold">{order.items?.length || 0}</p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold">Items:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    {item.name} x {item.quantity}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Track Order
              </Button>
              {order.invoice_url && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Invoice
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
