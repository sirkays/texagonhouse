// providers/CartProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category?: string;
  type?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  instructor?: string;
  duration?: string;
  students?: number;
  bestseller?: boolean;
  bnplAvailable?: boolean;
  author?: string;
  brand?: string;
  pages?: number;
  publisher?: string;
  specs?: string;
  warranty?: string;
  inStock?: boolean;
  narrator?: string;
  episodes?: number;
  includes?: string;
  value?: string;
  format?: string;
  jobGuarantee?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  getTotalItems: () => number;
  setCartItems: (items: CartItem[]) => void;
  buyNowProduct: CartItem | null;
  setBuyNowProduct: (product: CartItem | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
  const [cartItems, setCartItemsState] = useState<CartItem[]>([]);
  const [buyNowProduct, setBuyNowProductState] = useState<CartItem | null>(
    null
  );

  const setCartItems = useCallback((items: CartItem[]) => {
    setCartItemsState(items);
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCartItemsState((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item
        );
      }
      return [...prev, {...product, quantity: 1}];
    });
  }, []);

  const updateQuantity = useCallback((id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItemsState((prev) =>
      prev.map((item) =>
        item.id === id ? {...item, quantity: newQuantity} : item
      )
    );
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCartItemsState((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const clearCart = useCallback(() => {
    setCartItemsState([]);
  }, []);

  const setBuyNowProduct = useCallback((product: CartItem | null) => {
    setBuyNowProductState(product);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotalItems,
        setCartItems,
        buyNowProduct,
        setBuyNowProduct,
        clearCart,
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
