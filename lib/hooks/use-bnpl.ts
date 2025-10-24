// import useSWR from "swr"
// import { clientApiCall } from "@/lib/api-client-browser"

// const fetcher = (url: string) => clientApiCall(url)

// export function useBNPLPlans() {
//   const { data, error, isLoading } = useSWR("/api/store/bnpl?endpoint=plans", fetcher)
//   return { plans: data?.results || [], error, isLoading }
// }

// export function useBNPLAgreement(agreementId: string) {
//   const { data, error, isLoading } = useSWR(
//     agreementId ? `/api/store/bnpl?endpoint=agreement&id=${agreementId}` : null,
//     fetcher,
//   )
//   return { agreement: data, error, isLoading }
// }

// export async function startBNPLAgreement(orderId: string, planId: string) {
//   const response = await clientApiCall("/api/store/bnpl", {
//     method: "POST",
//     body: JSON.stringify({ action: "start", orderId, planId }),
//   })
//   return response
// }

// lib/hooks/use-bnpl.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useBNPLPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await fetcher("/api/store/bnpl?endpoint=plans");
        setPlans(data.results || []);
      } catch (err) {
        setError("Failed to fetch BNPL plans");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return {plans, isLoading, error};
}
