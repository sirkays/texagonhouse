"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; slug: string };
type ProductType = "course" | "book" | "audio" | "hardware" | "bundle" | "bootcamp";

export type ProductPayload = {
  title: string;
  slug?: string;
  product_type: ProductType;
  category?: string | null;
  description?: string;
  price: string | number;
  bnpl_enabled: boolean;
  is_digital: boolean;
  sku?: string;
  stock?: number;
  is_active: boolean;
};

export function ProductFormModal({
  open,
  onOpenChange,
  categories,
  initial,
  submitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categories: Category[];
  initial?: any | null; // product object from backend (when editing)
  submitting?: boolean;
  onSubmit: (payload: ProductPayload) => void;
}) {
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [productType, setProductType] = useState<ProductType>("hardware");
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0.00");
  const [bnplEnabled, setBnplEnabled] = useState(true);
  const [isDigital, setIsDigital] = useState(true);
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;

    setTitle(String(initial?.title ?? ""));
    setSlug(String(initial?.slug ?? ""));
    setProductType((initial?.product_type ?? "hardware") as ProductType);
    setCategory(initial?.category ?? null);
    setDescription(String(initial?.description ?? ""));
    setPrice(String(initial?.price ?? "0.00"));
    setBnplEnabled(Boolean(initial?.bnpl_enabled ?? true));
    setIsDigital(Boolean(initial?.is_digital ?? true));
    setSku(String(initial?.sku ?? ""));
    setStock(Number(initial?.stock ?? 0));
    setIsActive(Boolean(initial?.is_active ?? true));
  }, [open, initial]);

  const requiresSku = useMemo(() => !isDigital, [isDigital]);

  function submit() {
    const payload: ProductPayload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      product_type: productType,
      category: category || null,
      description,
      price,
      bnpl_enabled: bnplEnabled,
      is_digital: isDigital,
      sku: requiresSku ? sku.trim() : "",
      stock: requiresSku ? Number(stock || 0) : 0,
      is_active: isActive,
    };
    onSubmit(payload);
  }
  const CATEGORY_NONE = "__none__";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create Product"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />
          </div>

          <div className="space-y-2">
            <Label>Slug (optional)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if empty" />
          </div>

          <div className="space-y-2">
            <Label>Product Type</Label>
            <Select value={productType} onValueChange={(v) => setProductType(v as ProductType)}>
              <SelectTrigger><SelectValue placeholder="Choose type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Online Course</SelectItem>
                <SelectItem value="book">Book / eBook</SelectItem>
                <SelectItem value="audio">Audio Course</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
                <SelectItem value="bootcamp">Bootcamp</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label>Category</Label>

            <Select
              value={category && String(category).trim() ? String(category) : CATEGORY_NONE}
              onValueChange={(v) => setCategory(v === CATEGORY_NONE ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={CATEGORY_NONE}>No category</SelectItem>

                {(Array.isArray(categories) ? categories : [])
                  .map((c) => ({
                    ...c,
                    id: String(c?.id ?? "").trim(),
                    name: String(c?.name ?? "").trim(),
                  }))
                  .filter((c) => c.id.length > 0) // ✅ prevents empty ids
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || c.slug || c.id}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="space-y-2">
            <Label>Price (NGN)</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>BNPL Enabled</Label>
              <div className="text-xs text-muted-foreground">Allow pay-in-installments</div>
            </div>
            <Switch checked={bnplEnabled} onCheckedChange={setBnplEnabled} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Digital Product</Label>
              <div className="text-xs text-muted-foreground">Disable for physical items</div>
            </div>
            <Switch checked={isDigital} onCheckedChange={setIsDigital} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <div className="text-xs text-muted-foreground">Visible in store</div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2 ${requiresSku ? "" : "opacity-50 pointer-events-none"}`}>
            <div className="space-y-2">
              <Label>SKU (required for physical)</Label>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={String(stock)}
                onChange={(e) => setStock(Number(e.target.value || 0))}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!!submitting || !title.trim()}>
            {submitting ? "Saving..." : isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
