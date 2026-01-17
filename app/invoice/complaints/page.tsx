"use client";

import { Suspense } from "react";
import { PaymentComplaints } from "@/components/invoice/payment-complaints";

function ComplaintsContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
          <p className="text-muted-foreground">
            Submit payment complaints and track support tickets
          </p>
        </div>

        <PaymentComplaints />
      </div>
    </div>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <ComplaintsContent />
    </Suspense>
  );
}
