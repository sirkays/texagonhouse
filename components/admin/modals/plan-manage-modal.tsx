"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type Plan = {
  id: number;
  name: string;
  price: string;
  billing_period: string;
  student_limit: number;
};

export function PlanManageModal({
  open,
  onOpenChange,
  plan,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan | null;
  onUpdated: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", price: "", billing_period: "30", student_limit: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setForm({
        name: plan.name,
        price: plan.price,
        billing_period: plan.billing_period,
        student_limit: plan.student_limit,
      });
    }
  }, [plan]);

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/billing/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Saved", description: "Plan updated" });
      onUpdated();
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to update plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const activate = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/billing/plans/${plan.id}/activate`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Activated", description: "Plan activated for this organization" });
      onUpdated();
      onOpenChange(false);
    } catch {
      toast({ title: "Error", description: "Failed to activate plan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1 text-muted-foreground">Name</div>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm mb-1 text-muted-foreground">Price</div>
              <Input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
            </div>
            <div>
              <div className="text-sm mb-1 text-muted-foreground">Billing days</div>
              <Input
                value={form.billing_period}
                onChange={(e) => setForm((p) => ({ ...p, billing_period: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="text-sm mb-1 text-muted-foreground">Student limit (0 = unlimited)</div>
            <Input
              value={String(form.student_limit)}
              onChange={(e) => setForm((p) => ({ ...p, student_limit: Number(e.target.value || 0) }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving} variant="outline" className="flex-1">
              Save Changes
            </Button>
            <Button onClick={activate} disabled={saving} className="flex-1">
              Activate For Org
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
