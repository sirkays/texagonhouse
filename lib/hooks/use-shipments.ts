// lib/hooks/use-shipments.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useShipments(orderId: string) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await fetcher(
          `/api/store/shipments?endpoint=order-shipments&orderId=${orderId}`
        );
        setShipments(data.results || []);
      } catch (err) {
        setError("Failed to fetch shipments");
      } finally {
        setIsLoading(false);
      }
    };
    if (orderId) fetchShipments();
  }, [orderId]);

  const trackShipment = async (trackingNumber: string, last4?: string) => {
    const params = new URLSearchParams({tracking_number: trackingNumber});
    if (last4) params.append("last4", last4);
    return await fetcher(
      `/api/store/shipments?endpoint=track&${params.toString()}`
    );
  };

  return {shipments, trackShipment, isLoading, error};
}
