// app/store/layout.tsx
"use client";

import {CartProvider} from "@/providers/CartProvider";

export default function StoreLayout({children}: {children: React.ReactNode}) {
  return <CartProvider>{children}</CartProvider>;
}
