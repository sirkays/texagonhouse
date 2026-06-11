"use client";

import { Suspense } from "react";
import { PaymentComplaints } from "@/components/invoice/payment-complaints";

function ComplaintsContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#EF7B55] via-[#e8654a] to-[#d4533a] bg-clip-text text-transparent">
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">
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
