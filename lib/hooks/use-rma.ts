// lib/hooks/use-rma.ts
"use client";

import {fetcher} from "@/lib/utils";
import {useState} from "react";

export function useRMA(orderId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRMA = async (rmaData: {reason: string; items: any[]}) => {
    setIsLoading(true);
    try {
      const data = await fetcher(`/api/store/orders/${orderId}/rma`, {
        method: "POST",
        body: JSON.stringify(rmaData),
      });
      return data;
    } catch (err) {
      setError("Failed to create RMA");
    } finally {
      setIsLoading(false);
    }
  };

  return {createRMA, isLoading, error};
}
