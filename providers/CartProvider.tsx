// texagon_academy\texagonui\providers\CartProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  line_total: string;
  image: string;
  type: string;
  bnpl_enabled: boolean;
}

interface CartSummary {
  id: string;
  subtotal: string;
  discount_total: string;
  grand_total: string;
  coupon: string | null;

  // ✅ NEW
  shipping_total: string;
  tax_total: string;
  payable_total: string;
}


interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  getTotalItems: () => number;
  clearCart: () => void;

  buyNowProduct: CartItem | null;
  setBuyNowProduct: (product: CartItem | null) => void;

  isCartMutating: boolean;
  refreshCart: () => Promise<void>; // ✅ optional but useful
  cartSummary: CartSummary;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyNowProduct, setBuyNowProduct] = useState<CartItem | null>(null);
  const [isCartMutating, setIsCartMutating] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    id: "",
    subtotal: "0.00",
    discount_total: "0.00",
    grand_total: "0.00",
    coupon: null,

    shipping_total: "0.00",
    tax_total: "0.00",
    payable_total: "0.00",
  });

  const fetchCart = useCallback(async () => {
    // ✅ IMPORTANT: disable caching
    const res = await fetch("/api/store/cart", {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

  if (res.ok) {
    const data = await res.json();
    
  setCartItems(
    (data.items || []).map((item: any) => ({
      id: String(item.id),
      product_id: String(item.product_id),
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      line_total: item.line_total,

      // ✅ IMPORTANT: backend returns image_url, not image
      image: item.image_url || item.image || "",

      type: item.type,
      bnpl_enabled: item.bnpl_enabled,
    }))
  );

  // ✅ SAVE TOTALS (discount + grand total)
  setCartSummary({
    id: String(data.id || ""),
    subtotal: String(data.subtotal ?? "0.00"),
    discount_total: String(data.discount_total ?? "0.00"),
    grand_total: String(data.grand_total ?? "0.00"),
    coupon: data.coupon ?? null,

    shipping_total: String(data.shipping_total ?? "0.00"),
    tax_total: String(data.tax_total ?? "0.00"),
    payable_total: String(data.payable_total ?? "0.00"),
  });

}
else if (res.status === 401) {
      // optionally clear cart if unauthorized
      // setCartItems([])
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const withCartMutation = useCallback(
    async (fn: () => Promise<Response>) => {
      if (isCartMutating) return;

      setIsCartMutating(true);
      try {
        const res = await fn();
        if (res.ok) {
          // ✅ make sure refresh is not cached
          await fetchCart();
        }
      } finally {
        setIsCartMutating(false);
      }
    },
    [fetchCart, isCartMutating]
  );

  const addToCart = useCallback(
    async (product: any) => {
      await withCartMutation(() =>
        fetch("/api/store/cart/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.product_id ?? product.id, quantity: 1 }),
        })
      );
    },
    [withCartMutation]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      await withCartMutation(() =>
        fetch(`/api/store/cart/items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        })
      );
    },
    [withCartMutation]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      await withCartMutation(() =>
        fetch(`/api/store/cart/items/${id}/remove`, {
          method: "DELETE",
        })
      );
    },
    [withCartMutation]
  );

  const getTotalItems = useCallback(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartSummary,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotalItems,
        clearCart,
        buyNowProduct,
        setBuyNowProduct,
        isCartMutating,
        refreshCart, // ✅ it IS provided
      }}
    >


      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
