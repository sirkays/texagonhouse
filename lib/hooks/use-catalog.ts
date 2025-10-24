// import useSWR from "swr"
// import { clientApiCall } from "@/lib/api-client-browser"

// const fetcher = (url: string) => clientApiCall(url)

// export function useCategories() {
//   const { data, error, isLoading } = useSWR("/api/store/catalog?endpoint=categories", fetcher)
//   return { categories: data?.results || [], error, isLoading }
// }

// export function useProducts(query?: string, category?: string, sort?: string, page?: number) {
//   const params = new URLSearchParams({
//     endpoint: "products",
//     ...(query && { q: query }),
//     ...(category && { category }),
//     ...(sort && { sort }),
//     ...(page && { page: page.toString() }),
//   })

//   const { data, error, isLoading } = useSWR(`/api/store/catalog?${params.toString()}`, fetcher)
//   return { products: data?.results?.results || [], error, isLoading, pagination: data }
// }

// export function useProductDetail(slug: string) {
//   const { data, error, isLoading } = useSWR(
//     slug ? `/api/store/catalog?endpoint=product-detail&slug=${slug}` : null,
//     fetcher,
//   )
//   return { product: data, error, isLoading }
// }

// export function useCatalog(options?: { search?: string; category?: string; sort?: string; page?: number }) {
//   const { categories, error: categoriesError, isLoading: categoriesLoading } = useCategories()
//   const {
//     products,
//     error: productsError,
//     isLoading: productsLoading,
//     pagination,
//   } = useProducts(options?.search, options?.category, options?.sort, options?.page)

//   return {
//     products,
//     categories,
//     isLoading: categoriesLoading || productsLoading,
//     error: categoriesError || productsError,
//     pagination,
//   }
// }

// lib/hooks/use-catalog.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetcher("/api/store/catalog?endpoint=categories");
        setCategories(data.results || []);
      } catch (err) {
        setError("Failed to fetch categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return {categories, isLoading, error};
}

export function useProducts(
  search = "",
  category = "",
  sort = "popular",
  page = 1
) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams({
          endpoint: "products",
          q: search,
          category,
          sort,
          page: page.toString(),
          page_size: "20",
        }).toString();
        const data = await fetcher(`/api/store/catalog?${params}`);
        setProducts(data.results.results || []);
        setPagination({
          next: data.next,
          previous: data.previous,
          count: data.count,
        });
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, sort, page]);

  return {products, isLoading, error, pagination};
}

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await fetcher(
          `/api/store/catalog?endpoint=product-detail&slug=${productId}`
        );
        setProduct(data);
      } catch (err) {
        setError("Failed to fetch product");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  return {product, isLoading, error};
}
