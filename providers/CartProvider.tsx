"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {toast} from "sonner";

interface CartItem {
  id: string; // Cart item ID (UUID)
  productId: string; // Added: product_id from backend
  name: string; // Maps to title
  price: number;
  quantity: number;
  image?: string;
  type?: string;
  originalPrice?: number;
  bnplAvailable?: boolean;
  instructor?: string;
  author?: string;
  brand?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "id" | "quantity">) => Promise<void>; // Product doesn't have cart item ID yet
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  getTotalItems: () => number;
  setCartItems: (items: CartItem[]) => void;
  buyNowProduct: CartItem | null;
  setBuyNowProduct: (product: CartItem | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyNowProduct, setBuyNowProduct] = useState<CartItem | null>(null);

  // Helper to map backend items to local CartItem
  const mapBackendToLocal = (backendItems: any[]): CartItem[] => {
    return backendItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.title,
      price: parseFloat(item.price),
      quantity: item.quantity,
      // Add other fields if available in backend response (e.g., image, type from product details)
      // For now, assuming they're not in cart response; fetch if needed
    }));
  };

  // Fetch cart from backend on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/store/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(mapBackendToLocal(data.items || []));
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart");
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (product: Omit<CartItem, "id" | "quantity">) => {
    // Optimistic update: Add to local state first (check by productId)
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.productId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? {...item, quantity: item.quantity + 1}
            : item
        );
      }
      return [...prev, {...product, id: "temp-" + Date.now(), quantity: 1}]; // Temp ID for optimistic
    });

    try {
      const res = await fetch("/api/store/cart/add", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({product_id: product.productId, quantity: 1}),
      });
      console.log(res, " json resp....")
      if (!res.ok) throw new Error("Failed to add to cart");

      const data = await res.json();
      setCartItems(mapBackendToLocal(data.items || []));
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Rollback
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.productId === product.productId
        );
        if (existing && existing.quantity > 1) {
          return prev.map((item) =>
            item.productId === product.productId
              ? {...item, quantity: item.quantity - 1}
              : item
          );
        }
        return prev.filter((item) => item.productId !== product.productId);
      });
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (id: string) => {
    // Optimistic update
    const itemToRemove = cartItems.find((item) => item.id === id);
    setCartItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/store/cart/items/${id}/remove`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from cart");

      const data = await res.json();
      setCartItems(mapBackendToLocal(data.items || []));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      // Rollback
      if (itemToRemove) setCartItems((prev) => [...prev, itemToRemove]);
      toast.error("Failed to remove from cart");
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(id);
      return;
    }

    // Optimistic update
    const prevQuantity =
      cartItems.find((item) => item.id === id)?.quantity || 0;
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? {...item, quantity} : item))
    );

    try {
      const res = await fetch(`/api/store/cart/items/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({quantity}),
      });
      if (!res.ok) throw new Error("Failed to update quantity");

      const data = await res.json();
      setCartItems(mapBackendToLocal(data.items || []));
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Rollback
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? {...item, quantity: prevQuantity} : item
        )
      );
      toast.error("Failed to update quantity");
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        setCartItems,
        buyNowProduct,
        setBuyNowProduct,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
