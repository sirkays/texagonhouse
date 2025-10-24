// import useSWR from "swr"
// import { clientApiCall } from "@/lib/api-client-browser"

// const fetcher = (url: string) => clientApiCall(url)

// export function useOrders() {
//   const { data, error, isLoading } = useSWR("/api/store/orders", fetcher)
//   return { orders: data?.results || [], error, isLoading }
// }

// export function useOrderDetail(orderId: string) {
//   const { data, error, isLoading } = useSWR(orderId ? `/api/store/orders?id=${orderId}` : null, fetcher)
//   return { order: data, error, isLoading }
// }

// export function useOrderShipments(orderId: string) {
//   const { data, error, isLoading } = useSWR(
//     orderId ? `/api/store/shipments?endpoint=order-shipments&orderId=${orderId}` : null,
//     fetcher,
//   )
//   return { shipments: data?.results || [], error, isLoading }
// }

// lib/hooks/use-orders.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await fetcher("/api/store/orders");
        setOrders(data.results || []);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return {orders, isLoading, error};
}
