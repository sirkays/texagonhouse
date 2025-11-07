// components/store/leave-review.tsx
"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

// Reuse inline icon style to match theme
const ReviewIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a1 1 0 01.9.55l1.27 2.57 2.84.41a1 1 0 01.55 1.7l-2.05 2 .48 2.82a1 1 0 01-1.45 1.05L12 15.77l-2.54 1.33a1 1 0 01-1.45-1.05l.48-2.82-2.05-2a1 1 0 01.55-1.7l2.84-.41L11.1 5.55A1 1 0 0112 5z" />
  </svg>
);

export default function LeaveReview({
  productId,
  productName = "",
  orderId = "",
}: {
  productId: string;
  productName?: string;
  orderId?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    productName,
    orderId,
    rating: 0,
    title: "",
    review: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const {toast} = useToast();
  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Email is invalid.";
    if (!form.rating) e.rating = "Please select a rating.";
    if (!form.review.trim()) e.review = "Review cannot be empty.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const res = await fetch(`/api/store/reviews/${productId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        rating: form.rating,
        title: form.title,
        body: form.review,
      }),
    });
    if (res.ok) {
      toast({title: "Review submitted successfully! Thank you."});
      setSubmitting(false);
      setForm((f) => ({...f, rating: 0, title: "", review: ""}));
      router.back();
    } else {
      toast({variant: "destructive", title: "Failed to submit review"});
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <ReviewIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900">
            Leave a Review
          </h1>
          <p className="text-neutral-600 mt-2">
            Share your experience to help us improve.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
                className={cn("bg-white", errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({...f, email: e.target.value}))
                }
                className={cn("bg-white", errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((f) => ({...f, rating: star}))}
                  className={cn(
                    "h-9 w-9 rounded-full border flex items-center justify-center transition",
                    form.rating >= star
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                  )}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
                  ★
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-xs text-red-600">{errors.rating}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Summarize your review"
              value={form.title}
              onChange={(e) => setForm((f) => ({...f, title: e.target.value}))}
              className="bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review">Review</Label>
            <textarea
              id="review"
              placeholder="Describe what you liked and what could be improved..."
              rows={5}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.review}
              onChange={(e) => setForm((f) => ({...f, review: e.target.value}))}
            />
            {errors.review && (
              <p className="text-xs text-red-600">{errors.review}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-neutral-500">
              By submitting, you consent to display your review per our policy.
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400">
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
