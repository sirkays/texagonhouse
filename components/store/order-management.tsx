"use client";

import {useState, useEffect} from "react";
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
  trackingUrl?: string;
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
  agreementId?: string;
}

export function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/store/orders");
        if (!res.ok) {
          console.error("Failed to fetch orders");
          return;
        }
        const { results } = await res.json();

        const detailedOrders = await Promise.all(
          results.map(async (order: any) => {
            const detailRes = await fetch(`/api/store/orders/${order.id}`);
            let detail;
            if (detailRes.ok) {
              detail = await detailRes.json();
            } else {
              console.error(`Failed to fetch order details for ${order.id}`);
              detail = {
                id: order.id,
                status: order.status,
                grand_total: order.grand_total,
                items: order.items,
                shipments: [],
              };
            }

            const hasShipments = detail.shipments.length > 0;
            const itemType = hasShipments ? "physical" : "digital";

            const items = detail.items.map((item: any) => ({
              name: item.title,
              price: parseFloat(item.price),
              type: itemType,
              downloadUrl: !hasShipments ? "#" : undefined,
              tracking: hasShipments ? detail.shipments[0]?.tracking_number : undefined,
              trackingUrl: hasShipments ? detail.shipments[0]?.tracking_url : undefined,
            }));

            let estimatedDelivery: string | undefined;
            if (hasShipments) {
              const shipment = detail.shipments[0];
              if (shipment.delivered_at) {
                estimatedDelivery = shipment.delivered_at.split("T")[0];
              } else if (shipment.shipped_at) {
                const shippedDate = new Date(shipment.shipped_at);
                shippedDate.setDate(shippedDate.getDate() + 7);
                estimatedDelivery = shippedDate.toISOString().split("T")[0];
              }
            }

            return {
              id: detail.id,
              date: order.created_at.split("T")[0],
              status: detail.status,
              total: parseFloat(detail.grand_total),
              items,
              paymentMethod: "Credit Card",
              estimatedDelivery,
            };
          })
        );

        setOrders(detailedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      }
    }

    loadData();
  }, []);

  const startBnpl = async (orderId: string) => {
    try {
      const plansRes = await fetch("/api/store/bnpl/plans");
      if (!plansRes.ok) {
        alert("Failed to fetch BNPL plans");
        return;
      }
      const { results: plans } = await plansRes.json();
      if (plans.length === 0) {
        alert("No BNPL plans available");
        return;
      }
      const plan = plans[0];

      const startRes = await fetch(`/api/store/bnpl/${orderId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: plan.id }),
      });
      if (!startRes.ok) {
        alert("Failed to start BNPL");
        return;
      }
      const { agreement_id } = await startRes.json();

      const agreementRes = await fetch(`/api/store/bnpl/agreements/${agreement_id}`);
      if (!agreementRes.ok) {
        alert("Failed to fetch BNPL agreement");
        return;
      }
      const agreement = await agreementRes.json();

      const unpaidInstallments = agreement.installments.filter(
        (i: any) => i.status !== "paid"
      );
      const remainingPayments = unpaidInstallments.length;
      const nextPayment = unpaidInstallments[0]?.due_at.split("T")[0];
      const paymentMethod = `${agreement.provider} - ${agreement.installments.length} payments`;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, paymentMethod, nextPayment, remainingPayments, agreementId: agreement_id }
            : o
        )
      );
    } catch (error) {
      alert("Error starting BNPL");
    }
  };

  const viewSchedule = async (agreementId: string | undefined) => {
    if (!agreementId) return;
    try {
      const res = await fetch(`/api/store/bnpl/agreements/${agreementId}`);
      if (!res.ok) {
        alert("Failed to fetch schedule");
        return;
      }
      const data = await res.json();
      alert(JSON.stringify(data.installments, null, 2));
    } catch (error) {
      alert("Error viewing schedule");
    }
  };

  const updateMethod = () => {
    alert("Update payment method not implemented");
  };

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
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">Order Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your orders and manage your purchases
        </p>
      </header>

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all-orders" className="space-y-6">
        {/* Tabs Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <TabsList className="flex w-full sm:w-auto justify-start sm:justify-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar bg-muted/50 p-2 rounded-2xl">
            <TabsTrigger
              value="all-orders"
              className="px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              All Orders
            </TabsTrigger>
            <TabsTrigger
              value="bnpl"
              className="px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              BNPL Orders
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Orders */}
        <TabsContent value="all-orders">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="flex flex-col shadow-sm hover:shadow-md transition-all rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span>Order {order.id}</span>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1 capitalize">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Placed on {order.date} • Total: ${order.total}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm sm:text-base">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                item.type === "digital"
                                  ? "secondary"
                                  : "outline"
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
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 border-t pt-3">
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
                    {order.paymentMethod === "Credit Card" && order.status === "processing" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => startBnpl(order.id)}>
                        Set up BNPL
                      </Button>
                    )}
                  </div>

                  {order.estimatedDelivery && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Estimated delivery: {order.estimatedDelivery}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* BNPL Orders */}
        <TabsContent value="bnpl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders
              .filter((order) => order.nextPayment)
              .map((order) => (
                <Card
                  key={order.id}
                  className="shadow-sm hover:shadow-md transition-all rounded-2xl">
                  <CardHeader>
                    <CardTitle>BNPL Order {order.id}</CardTitle>
                    <CardDescription>
                      Manage your payment schedule
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Next Payment</p>
                        <p className="font-medium">{order.nextPayment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium">{order.remainingPayments}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" className="w-full sm:w-auto" onClick={() => viewSchedule(order.agreementId)}>
                        View Schedule
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto" onClick={updateMethod}>
                        Update Method
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