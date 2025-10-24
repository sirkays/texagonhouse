// lib/hooks/use-reviews.ts
"use client";

import {useState} from "react";
import {fetcher} from "@/lib/utils";

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = async (reviewData: {
    rating: number;
    title: string;
    body: string;
  }) => {
    setIsLoading(true);
    try {
      await fetcher(`/api/store/reviews/${productId}`, {
        method: "POST",
        body: JSON.stringify(reviewData),
      });
      // Note: API doesn't return reviews list; fetch would require a new endpoint
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  return {reviews, submitReview, isLoading, error};
}
