// app/store/page.tsx
"use client";

import {Suspense} from "react";
import {StorePageIndex} from "@/components/store/store-index";

export default function StorePage() {
  return (
    <Suspense
      fallback={<div className="text-center py-10">Loading store...</div>}>
      <StorePageIndex />
    </Suspense>
  );
}
