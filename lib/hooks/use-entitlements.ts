// lib/hooks/use-entitlements.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useEntitlements() {
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntitlements = async () => {
      try {
        const data = await fetcher("/api/store/entitlements");
        setEntitlements(data.results || []);
      } catch (err) {
        setError("Failed to fetch entitlements");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntitlements();
  }, []);

  return {entitlements, isLoading, error};
}
