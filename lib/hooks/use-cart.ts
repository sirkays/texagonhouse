// import useSWR, { mutate } from "swr"
// import { clientApiCall } from "@/lib/api-client-browser"

// const fetcher = (url: string) => clientApiCall(url)

// export function useCart() {
//   const { data, error, isLoading } = useSWR("/api/store/cart", fetcher)

//   const addToCart = async (productId: string, quantity = 1) => {
//     const response = await clientApiCall("/api/store/cart", {
//       method: "POST",
//       body: JSON.stringify({ action: "add", product_id: productId, quantity }),
//     })
//     mutate("/api/store/cart")
//     return response
//   }

//   const updateCartItem = async (itemId: string, quantity: number) => {
//     const response = await clientApiCall(`/api/store/cart/items?id=${itemId}`, {
//       method: "PATCH",
//       body: JSON.stringify({ quantity }),
//     })
//     mutate("/api/store/cart")
//     return response
//   }

//   const removeFromCart = async (itemId: string) => {
//     const response = await clientApiCall(`/api/store/cart/items?id=${itemId}`, {
//       method: "DELETE",
//     })
//     mutate("/api/store/cart")
//     return response
//   }

//   const applyCoupon = async (code: string) => {
//     const response = await clientApiCall("/api/store/cart", {
//       method: "POST",
//       body: JSON.stringify({ action: "apply-coupon", code }),
//     })
//     mutate("/api/store/cart")
//     return response
//   }

//   return {
//     cart: data,
//     error,
//     isLoading,
//     addToCart,
//     updateCartItem,
//     removeFromCart,
//     applyCoupon,
//   }
// }

// lib/hooks/use-cart.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useCart() {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await fetcher("/api/store/cart");
        setCart(data);
      } catch (err) {
        setError("Failed to fetch cart");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (productId: string, quantity: number) => {
    await fetcher("/api/store/cart", {
      method: "POST",
      body: JSON.stringify({action: "add", product_id: productId, quantity}),
    });
    const updatedCart = await fetcher("/api/store/cart");
    setCart(updatedCart);
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    await fetcher(`/api/store/cart/items?id=${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({quantity}),
    });
    const updatedCart = await fetcher("/api/store/cart");
    setCart(updatedCart);
  };

  const removeFromCart = async (itemId: string) => {
    await fetcher(`/api/store/cart/items?id=${itemId}`, {method: "DELETE"});
    const updatedCart = await fetcher("/api/store/cart");
    setCart(updatedCart);
  };

  const applyCoupon = async (code: string) => {
    await fetcher("/api/store/cart", {
      method: "POST",
      body: JSON.stringify({action: "apply-coupon", code}),
    });
    const updatedCart = await fetcher("/api/store/cart");
    setCart(updatedCart);
  };

  return {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    applyCoupon,
    isLoading,
    error,
  };
}
