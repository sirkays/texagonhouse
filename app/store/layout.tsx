// app/parent/layout.tsx
"use client";

import {CartProvider} from "@/providers/CartProvider";

export default function ParentLayout({children}: {children: React.ReactNode}) {
  return <CartProvider>{children}</CartProvider>;
}
