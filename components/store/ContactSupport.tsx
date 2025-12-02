// components/store/contact-support.tsx
"use client";

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";
import {useToast} from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SupportIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a8 8 0 0 0-8 8v2a3 3 0 0 0 3 3h1v-5H7a5 5 0 0 1 10 0h-1v5h1a3 3 0 0 0 3-3v-2a8 8 0 0 0-8-8zm-1 18a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2z" />
  </svg>
);

const PaperClipIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}>
    <path d="M21.44 11.05l-8.49 8.49a5.5 5.5 0 01-7.78-7.78L13.66 3.3a3.5 3.5 0 114.95 4.95L9.88 16.98a1.5 1.5 0 11-2.12-2.12l7.78-7.78" />
  </svg>
);

export default function ContactSupport({
  orderId,
  email,
}: {
  orderId?: string;
  email?: string;
}) {
  const [form, setForm] = useState({
    name: "",
    email: email || "",
    orderId: orderId || "",
    category: "",
    priority: "",
    message: "",
    attachment: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const {toast} = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email is invalid.";
    if (!form.orderId.trim()) newErrors.orderId = "Order ID is required.";
    if (!form.category.trim()) newErrors.category = "Category is required.";
    if (!form.message.trim()) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    // Simulate API call, since no backend for support
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({title: "Support request submitted successfully!"});
    setSubmitting(false);
    // Reset form
    setForm({
      name: "",
      email: email || "",
      orderId: orderId || "",
      category: "",
      priority: "",
      message: "",
      attachment: null,
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-xl p-8">
        <div className="text-center mb-8">
          <SupportIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900">
            Contact Support
          </h1>
          <p className="text-neutral-600 mt-2">
            We're here to help. Fill out the form below and we'll get back to
            you soon.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="text"
                placeholder="e.g., ORD-12345"
                value={form.orderId}
                onChange={(e) =>
                  setForm((f) => ({...f, orderId: e.target.value}))
                }
                className={cn("bg-white", errors.orderId && "border-red-500")}
              />
              {errors.orderId && (
                <p className="text-xs text-red-600">{errors.orderId}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((f) => ({...f, category: value}))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="support">General Support</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="priority">Priority (optional)</Label>
            <Select
              value={form.priority}
              onValueChange={(value) =>
                setForm((f) => ({...f, priority: value}))
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="attachment">Attachment (optional)</Label>
            <div className="flex items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100">
                <PaperClipIcon className="h-4 w-4" />
                <span>Upload file</span>
                <input
                  id="attachment"
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      attachment: e.target.files?.[0] || null,
                    }))
                  }
                />
              </label>
              {form.attachment && (
                <span className="truncate text-xs text-neutral-500">
                  {form.attachment.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              placeholder="Describe the issue you're facing..."
              rows={5}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({...f, message: e.target.value}))
              }
            />
            {errors.message && (
              <p className="text-xs text-red-600">{errors.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-neutral-500">
              By submitting, you agree to our support policy.
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 text-white hover:bg-orange-600 focus:ring-2 focus:ring-orange-400">
              {submitting ? "Sending..." : "Send Support Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
