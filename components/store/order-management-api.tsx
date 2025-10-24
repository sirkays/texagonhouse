// "use client"

// import { useOrders } from "@/lib/hooks/use-orders"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Package, Truck, CheckCircle, Clock } from "lucide-react"

// export function OrderManagementAPI() {
//   const { orders, isLoading } = useOrders()

//   if (isLoading) {
//     return <div className="text-center py-8">Loading orders...</div>
//   }

//   if (orders.length === 0) {
//     return (
//       <Card>
//         <CardContent className="py-8 text-center">
//           <p className="text-gray-600">No orders yet</p>
//         </CardContent>
//       </Card>
//     )
//   }

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "fulfilled":
//         return <CheckCircle className="h-5 w-5 text-green-600" />
//       case "shipped":
//         return <Truck className="h-5 w-5 text-blue-600" />
//       case "pending":
//         return <Clock className="h-5 w-5 text-yellow-600" />
//       default:
//         return <Package className="h-5 w-5" />
//     }
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">My Orders</h2>

//       {orders.map((order: any) => (
//         <Card key={order.id}>
//           <CardHeader>
//             <div className="flex justify-between items-start">
//               <div>
//                 <CardTitle className="flex items-center gap-2">
//                   Order {order.id.slice(0, 8)}
//                   <Badge className="flex items-center gap-1">
//                     {getStatusIcon(order.status)}
//                     {order.status}
//                   </Badge>
//                 </CardTitle>
//                 <p className="text-sm text-gray-600 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
//               </div>
//               <p className="text-2xl font-bold">${order.grand_total}</p>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <div className="space-y-2">
//               {order.items.map((item: any, idx: number) => (
//                 <div key={idx} className="flex justify-between text-sm">
//                   <span>{item.title}</span>
//                   <span>
//                     {item.qty}x ${item.price}
//                   </span>
//                 </div>
//               ))}
//             </div>
//             <Button variant="outline" className="w-full bg-transparent">
//               View Details
//             </Button>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }

// components/store/order-management-api.tsx
"use client";

import {useOrders} from "@/lib/hooks/use-orders";
import {useShipments} from "@/lib/hooks/use-shipments";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Package, Truck, CheckCircle, Clock} from "lucide-react";
import {useState} from "react";
import {Input} from "../ui/input";

export function OrderManagementAPI() {
  const {orders, isLoading} = useOrders();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [last4, setLast4] = useState("");

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">No orders yet</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "fulfilled":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Orders</h2>
      <div>
        <Input
          placeholder="Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Last 4 of ZIP"
          value={last4}
          onChange={(e) => setLast4(e.target.value)}
          className="mb-2"
        />
        <Button
          onClick={async () => {
            const shipment = await useShipments(orders[0].id).trackShipment(
              trackingNumber,
              last4
            );
            console.log("Shipment tracked:", shipment);
          }}>
          Track Shipment
        </Button>
      </div>
      {orders.map((order: any) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Order {order.id.slice(0, 8)}
                  <Badge className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className="text-2xl font-bold">${order.grand_total}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.title}</span>
                  <span>
                    {item.qty}x ${item.price}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
