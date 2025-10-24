"use client";

import {createContext, useContext, useState, type ReactNode} from "react";

interface CartItem {
  id: number;
  name: string;
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
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getTotalItems: () => number;
  setCartItems: (items: CartItem[]) => void;
  buyNowProduct: CartItem | null;
  setBuyNowProduct: (product: CartItem | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: ReactNode}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [buyNowProduct, setBuyNowProduct] = useState<CartItem | null>(null);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          type: product.type,
          originalPrice: product.original_price || product.originalPrice,
          bnplAvailable: product.bnpl_available || product.bnplAvailable,
          instructor: product.instructor,
          author: product.author,
          brand: product.brand,
        },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? {...item, quantity} : item))
    );
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
