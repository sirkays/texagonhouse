import type React from "react"
import { CartProvider } from "@/providers/CartProvider"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CartProvider>{children}</CartProvider>
}
