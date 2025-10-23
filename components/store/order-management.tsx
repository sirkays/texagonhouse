"use client";

import {useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  MessageSquare,
  Star,
  Calendar,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  type: string;
  downloadUrl?: string;
  tracking?: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  nextPayment?: string;
  remainingPayments?: number;
  estimatedDelivery?: string;
}

export function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders] = useState<Order[]>([
    {
      id: "ORD-2024-001",
      date: "2024-01-15",
      status: "delivered",
      total: 135.98,
      items: [
        {
          name: "Complete React Development Course",
          price: 89.99,
          type: "digital",
          downloadUrl: "#",
        },
        {
          name: "Python Programming Textbook",
          price: 45.99,
          type: "physical",
          tracking: "1Z999AA1234567890",
        },
      ],
      paymentMethod: "Klarna - 4 payments",
      nextPayment: "2024-02-15",
      remainingPayments: 2,
    },
    {
      id: "ORD-2024-002",
      date: "2024-01-10",
      status: "shipped",
      total: 899.99,
      items: [
        {
          name: "Programming Laptop - Student Edition",
          price: 899.99,
          type: "physical",
          tracking: "1Z999AA1234567891",
        },
      ],
      paymentMethod: "Afterpay - 4 payments",
      nextPayment: "2024-02-10",
      remainingPayments: 3,
      estimatedDelivery: "2024-01-18",
    },
    {
      id: "ORD-2024-003",
      date: "2024-01-05",
      status: "processing",
      total: 199.99,
      items: [
        {
          name: "Data Science Toolkit",
          price: 199.99,
          type: "mixed",
        },
      ],
      paymentMethod: "Credit Card",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">
          Track your orders and manage your purchases
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all-orders" className="space-y-6">
        <TabsList className="overflow-x-auto whitespace-nowrap no-scrollbar">
          <TabsTrigger value="all-orders" className="shrink-0 min-w-[150px]">
            All Orders
          </TabsTrigger>
          <TabsTrigger
            value="bnpl"
            className="shrink-0 min-w-[150px] sm:min-w-[150px]">
            BNPL Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-orders" className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order {order.id}
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Placed on {order.date} • Total: ${order.total}
                    </CardDescription>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="font-medium">{order.paymentMethod}</p>
                    {order.nextPayment && (
                      <p className="text-xs text-muted-foreground">
                        Next payment: {order.nextPayment} (
                        {order.remainingPayments} remaining)
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              item.type === "digital" ? "secondary" : "outline"
                            }>
                            {item.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${item.price}
                          </span>
                        </div>
                        {item.tracking && (
                          <p className="text-xs text-muted-foreground">
                            Tracking: {item.tracking}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {item.type === "digital" && item.downloadUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-3 w-3" />
                            Download
                          </Button>
                        )}
                        {item.tracking && (
                          <Button variant="outline" size="sm">
                            <Truck className="mr-2 h-3 w-3" />
                            Track
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row sm:gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto">
                    <MessageSquare className="mr-2 h-3 w-3" />
                    Contact Support
                  </Button>
                  {order.status === "delivered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto">
                      <Star className="mr-2 h-3 w-3" />
                      Leave Review
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Reorder
                  </Button>
                </div>

                {/* Delivery Estimate */}
                {order.estimatedDelivery && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Estimated delivery: {order.estimatedDelivery}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="digital">
          <div className="space-y-4">
            {filteredOrders
              .filter((order) =>
                order.items.some((item) => item.type === "digital")
              )
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle>Digital Products - Order {order.id}</CardTitle>
                    <CardDescription>
                      Instant access to your digital content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items
                        .filter((item) => item.type === "digital")
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${item.price}
                              </p>
                            </div>
                            <Button>
                              <Download className="mr-2 h-4 w-4" />
                              Access Content
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="physical">
          <div className="space-y-4">
            {filteredOrders
              .filter((order) =>
                order.items.some((item) => item.type === "physical")
              )
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle>Physical Products - Order {order.id}</CardTitle>
                    <CardDescription>Track your shipments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items
                        .filter((item) => item.type === "physical")
                        .map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${item.price}
                              </p>
                              {item.tracking && (
                                <p className="text-xs text-muted-foreground">
                                  Tracking: {item.tracking}
                                </p>
                              )}
                            </div>
                            <Button variant="outline">
                              <Truck className="mr-2 h-4 w-4" />
                              Track Package
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="bnpl">
          <div className="space-y-4">
            {filteredOrders
              .filter((order) => order.nextPayment)
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle>BNPL Order {order.id}</CardTitle>
                    <CardDescription>
                      Manage your payment schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Payment Method
                        </p>
                        <p className="font-medium">{order.paymentMethod}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Next Payment
                        </p>
                        <p className="font-medium">{order.nextPayment}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Remaining Payments
                        </p>
                        <p className="font-medium">{order.remainingPayments}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Payment Amount
                        </p>
                        <p className="font-medium">
                          ${(order.total / 4).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" className="w-full sm:w-auto">
                        View Payment Schedule
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Update Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
