// lib/api/store.ts
const BASE_URL = "https://texagonbackend.epichouse.online/store/api";
const API_KEY = "1eHxj2VU.cvTFX2nWYGyTs5HHA0CZpNJqJCjUslbz";

export const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

// === Types ===
export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
}
export interface Product {
  id: string;
  title: string;
  slug: string;
  type: string;
  category: string;
  price: string;
  rating: number;
  rating_count: number;
  image: string | null;
  bnpl_enabled: boolean;
  description: string;
}
export interface CartItem {
  id: string;
  product_id: string;
  title: string;
  price: string;
  quantity: number;
  line_total: string;
}
export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  coupon: string | null;
}
export interface Order {
  id: string;
  status: string;
  grand_total: string;
  created_at: string;
  items: {title: string; qty: number; price: string}[];
}
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// === Catalog ===
export const getCategories = async (
  sessionToken?: string
): Promise<Paginated<Category>> => {
  const res = await fetch(`${BASE_URL}/categories`, {
    headers: headers(sessionToken),
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

export const getProducts = async (
  query: {
    page?: number;
    page_size?: number;
    q?: string;
    category?: string;
    type?: string;
    sort?: string;
    min_price?: number;
    max_price?: number;
  } = {},
  sessionToken?: string
): Promise<Paginated<Product>> => {
  const url = new URL(`${BASE_URL}/products`);
  Object.entries(query).forEach(
    ([k, v]) => v !== undefined && url.searchParams.append(k, String(v))
  );
  const res = await fetch(url, {headers: headers(sessionToken)});
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const getProductBySlug = async (
  slug: string,
  sessionToken?: string
): Promise<Product> => {
  const res = await fetch(`${BASE_URL}/products/${slug}`, {
    headers: headers(sessionToken),
  });
  if (!res.ok) throw new Error("Product not found");
  return res.json();
};

// === Cart ===
export const getCart = async (sessionToken: string): Promise<Cart> => {
  const res = await fetch(`${BASE_URL}/cart`, {headers: headers(sessionToken)});
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

export const addToCart = async (
  body: {product_id: string; quantity?: number},
  sessionToken: string
): Promise<Cart> => {
  const res = await fetch(`${BASE_URL}/cart/add`, {
    method: "POST",
    headers: headers(sessionToken),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
};

export const updateCartItem = async (
  item_id: string,
  quantity: number,
  sessionToken: string
): Promise<Cart> => {
  const res = await fetch(`${BASE_URL}/cart/items/${item_id}`, {
    method: "PATCH",
    headers: headers(sessionToken),
    body: JSON.stringify({quantity}),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
};

export const removeCartItem = async (
  item_id: string,
  sessionToken: string
): Promise<Cart> => {
  const res = await fetch(`${BASE_URL}/cart/items/${item_id}/remove`, {
    method: "DELETE",
    headers: headers(sessionToken),
  });
  if (!res.ok) throw new Error("Failed to remove item");
  return res.json();
};

export const applyCoupon = async (
  code: string,
  sessionToken: string
): Promise<Cart> => {
  const res = await fetch(`${BASE_URL}/cart/apply-coupon`, {
    method: "POST",
    headers: headers(sessionToken),
    body: JSON.stringify({code}),
  });
  if (!res.ok) throw new Error("Invalid coupon");
  return res.json();
};

// === Orders ===
export const getOrders = async (
  sessionToken: string
): Promise<Paginated<Order>> => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: headers(sessionToken),
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const createOrder = async (
  body: {billing_address_id?: string; shipping_address_id?: string},
  sessionToken: string
) => {
  const res = await fetch(`${BASE_URL}/checkout/create-order`, {
    method: "POST",
    headers: headers(sessionToken),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
};
