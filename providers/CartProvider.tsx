// "use client";

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   type ReactNode,
// } from "react";
// import {toast} from "sonner";

// interface CartItem {
//   id: string; // Cart item ID (UUID)
//   productId: string; // product_id from backend
//   name: string; // title
//   price: number;
//   quantity: number;
//   image?: string;
//   type?: string;
//   originalPrice?: number;
//   bnplAvailable?: boolean;
//   instructor?: string;
//   author?: string;
//   brand?: string;
// }

// interface CartContextType {
//   cartItems: CartItem[];
//   addToCart: (product: Omit<CartItem, "id" | "quantity">) => Promise<void>;
//   removeFromCart: (id: string) => Promise<void>;
//   updateQuantity: (id: string, quantity: number) => Promise<void>;
//   getTotalItems: () => number;
//   setCartItems: (items: CartItem[]) => void;
//   buyNowProduct: CartItem | null;
//   setBuyNowProduct: (product: CartItem | null) => void;
// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export function CartProvider({children}: {children: ReactNode}) {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [buyNowProduct, setBuyNowProduct] = useState<CartItem | null>(null);

//   // prevent duplicate calls for the same product while in-flight
//   const inFlight = useRef<Set<string>>(new Set());

//   const mapBackendToLocal = (backendItems: any[]): CartItem[] =>
//     backendItems.map((item) => ({
//       id: item.id,
//       productId: item.product_id,
//       name: item.title,
//       price: parseFloat(item.price),
//       quantity: item.quantity,
//     }));

//   useEffect(() => {
//     const fetchCart = async () => {
//       try {
//         const res = await fetch("/api/store/cart");
//         if (!res.ok) throw new Error("Failed to fetch cart");
//         const data = await res.json();
//         setCartItems(mapBackendToLocal(data.items || []));
//       } catch (error) {
//         console.error("Error fetching cart:", error);
//         toast.error("Failed to load cart");
//       }
//     };
//     fetchCart();
//   }, []);

//   const addToCart = async (product: Omit<CartItem, "id" | "quantity">) => {
//     const key = product.productId;
//     if (inFlight.current.has(key)) return;
//     inFlight.current.add(key);

//     // Optimistic update
//     setCartItems((prev) => {
//       const existing = prev.find((i) => i.productId === product.productId);
//       if (existing) {
//         return prev.map((i) =>
//           i.productId === product.productId
//             ? {...i, quantity: i.quantity + 1}
//             : i
//         );
//       }
//       return [...prev, {...product, id: "temp-" + Date.now(), quantity: 1}];
//     });

//     // idempotency key so double network deliveries are safe
//     const idemKey =
//       (typeof crypto !== "undefined" &&
//         "randomUUID" in crypto &&
//         crypto.randomUUID()) ||
//       `${Date.now()}_${Math.random().toString(36).slice(2)}`;

//     try {
//       const res = await fetch("/api/store/cart/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-idempotency-key": `add:${product.productId}:${idemKey}`,
//         },
//         body: JSON.stringify({product_id: product.productId, quantity: 1}),
//       });

//       if (!res.ok) throw new Error("Failed to add to cart");
//       const data = await res.json();

//       // Reconcile with backend truth
//       setCartItems(mapBackendToLocal(data.items || []));
//       toast.success(`${product.name} added to cart!`);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       // Roll back optimistic update
//       setCartItems((prev) => {
//         const existing = prev.find((i) => i.productId === product.productId);
//         if (existing && existing.quantity > 1) {
//           return prev.map((i) =>
//             i.productId === product.productId
//               ? {...i, quantity: i.quantity - 1}
//               : i
//           );
//         }
//         return prev.filter((i) => i.productId !== product.productId);
//       });
//       toast.error("Failed to add to cart");
//     } finally {
//       inFlight.current.delete(key);
//     }
//   };

//   const removeFromCart = async (id: string) => {
//     // Optimistic update
//     const itemToRemove = cartItems.find((item) => item.id === id);
//     setCartItems((prev) => prev.filter((item) => item.id !== id));

//     try {
//       const res = await fetch(`/api/store/cart/items/${id}/remove`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Failed to remove from cart");
//       const data = await res.json();
//       setCartItems(mapBackendToLocal(data.items || []));
//       toast.success("Item removed from cart");
//     } catch (error) {
//       console.error("Error removing from cart:", error);
//       if (itemToRemove) setCartItems((prev) => [...prev, itemToRemove]);
//       toast.error("Failed to remove from cart");
//     }
//   };

//   const updateQuantity = async (id: string, quantity: number) => {
//     if (quantity < 1) {
//       await removeFromCart(id);
//       return;
//     }
//     const prevQuantity =
//       cartItems.find((item) => item.id === id)?.quantity || 0;

//     // Optimistic update
//     setCartItems((prev) =>
//       prev.map((item) => (item.id === id ? {...item, quantity} : item))
//     );

//     try {
//       const res = await fetch(`/api/store/cart/items/${id}`, {
//         method: "PATCH",
//         headers: {"Content-Type": "application/json"},
//         body: JSON.stringify({quantity}),
//       });
//       if (!res.ok) throw new Error("Failed to update quantity");

//       const data = await res.json();
//       setCartItems(mapBackendToLocal(data.items || []));
//       toast.success("Quantity updated");
//     } catch (error) {
//       console.error("Error updating quantity:", error);
//       // Rollback
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item.id === id ? {...item, quantity: prevQuantity} : item
//         )
//       );
//       toast.error("Failed to update quantity");
//     }
//   };

//   const getTotalItems = () =>
//     cartItems.reduce((sum, item) => sum + item.quantity, 0);

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         getTotalItems,
//         setCartItems,
//         buyNowProduct,
//         setBuyNowProduct,
//       }}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) {
//     throw new Error("useCart must be used within CartProvider");
//   }
//   return context;
// }

"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

// interface CartItem {
//   id: string;
//   product_id: string;
//   title: string;
//   price: string;
//   quantity: number;
//   line_total: string;
//   image_url: string | null; // ← CHANGED FROM `image`
//   type: string;
//   bnpl_enabled: boolean;
// }

// Update interface
interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  line_total: string;
  image: string; // CHANGED
  type: string;
  bnpl_enabled: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  getTotalItems: () => number;
  clearCart: () => void;
  buyNowProduct: CartItem | null;
  setBuyNowProduct: (product: CartItem | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyNowProduct, setBuyNowProduct] = useState<CartItem | null>(null);

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/store/cart");
    if (res.ok) {
      const data = await res.json();
      // // providers/CartProvider.tsx (only this part)
      // setCartItems(
      //   data.items.map((item: any) => ({
      //     id: item.id,
      //     product_id: item.product_id,
      //     title: item.title,
      //     price: item.price,
      //     quantity: item.quantity,
      //     line_total: item.line_total,
      //     image_url: item.image_url || item.image, // ← MUST INCLUDE
      //     type: item.type,
      //     bnpl_enabled: item.bnpl_enabled,
      //   }))
      // );

      // providers/CartProvider.tsx (only fetchCart)
      setCartItems(
        data.items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          line_total: item.line_total,
          image: item.image, // FULL URL
          type: item.type,
          bnpl_enabled: item.bnpl_enabled,
        }))
      );
    } else if (res.status === 401) {
      // handle login redirect if needed
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product: any) => {
      const res = await fetch("/api/store/cart/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({product_id: product.id, quantity: 1}),
      });
      if (res.ok) {
        fetchCart();
      }
    },
    [fetchCart]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      const res = await fetch(`/api/store/cart/items/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({quantity}),
      });
      if (res.ok) {
        fetchCart();
      }
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/store/cart/items/${id}/remove`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCart();
      }
    },
    [fetchCart]
  );

  const getTotalItems = useCallback(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotalItems,
        clearCart,
        buyNowProduct,
        setBuyNowProduct,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
