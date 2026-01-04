// texagon_academy\texagonui\components\store\product-catalog.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  Star,
  ShoppingCart as ShoppingCartIcon,
  Loader2,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function ProductCatalog() {
  const router = useRouter();
  const { addToCart } = useCart();

  // ✅ UI input value (typing does NOT trigger search)
  const [searchInput, setSearchInput] = useState("");
  // ✅ Actual query used for fetching (only updates on button click)
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch categories once
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/store/categories");
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;

          setCategories([
            { id: "all", name: "All Products" },
            ...data.results.map((c: any) => ({ id: c.slug, name: c.name })),
          ]);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } finally {
        if (!cancelled) setLoadingCategories(false);
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const formatCurrency = (amount: any) =>
    amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ✅ Trigger search ONLY when the button is clicked
  const handleSearch = () => {
    // if user is already on page > 1 and searching, reset pagination via effect
    setSearchQuery(searchInput.trim());
  };

  // Reset product list when filters/search/sort change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedCategory, sortBy]);

  // Fetch products (with deduplication)
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoadingProducts(true);

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (selectedCategory !== "all") params.append("category", selectedCategory);

        let sort = sortBy;
        if (sortBy === "price-low") sort = "price_asc";
        if (sortBy === "price-high") sort = "price_desc";

        params.append("sort", sort);
        params.append("page", String(page));
        params.append("page_size", "20");

        const res = await fetch(`/api/store/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          return;
        }

        const data = await res.json();

        setProducts((prev) => {
          const combined = [...prev, ...data.results.results];
          return Array.from(new Map(combined.map((p) => [p.id, p])).values());
        });

        setHasMore(Boolean(data.next));
      } catch (e: any) {
        if (e.name !== "AbortError") console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [page, searchQuery, selectedCategory, sortBy]); // (router not needed)


  const ProductCard = ({ product }: { product: any }) => {
    const fullStars = Math.floor(product.rating || 0);

    return (
      <div
        onClick={() => router.push(`/store/product/${product.slug}`)}
        className="block cursor-pointer h-full"
      >
        {/* ✅ fixed height card */}
        <div className="relative flex h-[340px] flex-col p-2 border border-transparent hover:border-gray-300 transition-shadow hover:shadow-md">
          {/* ✅ fixed height image area */}
          <div className="relative h-40 w-full overflow-hidden">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer border-none"
              onMouseDown={(e) => e.preventDefault()} // ✅ prevents focus shift (and scroll)
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const y = window.scrollY;          // ✅ remember scroll
                await addToCart(product);
                requestAnimationFrame(() => window.scrollTo(0, y)); // ✅ restore

                toast.success(`${product.title} has been added to your cart.`);
              }}


            >
              <ShoppingCartIcon className="h-5 w-5 text-black" />
            </button>
          </div>

          {/* ✅ content area uses flex so bottom section aligns across cards */}
          <div className="flex flex-1 flex-col pt-2">
            {/* ✅ clamp title so it won’t change height */}
            <div className="text-sm font-medium line-clamp-2 min-h-[40px]">
              {product.title}
            </div>

            <div className="mt-2 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < fullStars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <div className="flex gap-2 text-sm">
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.rating_count})
                </span>
              </div>
            </div>

            {/* ✅ push price section to the bottom */}
            <div className="mt-auto pt-2">
              <div className="font-bold text-lg">
                ₦{formatCurrency(parseFloat(product.price))}
              </div>

          {product.bnpl_enabled ? (
            <div className="text-xs text-gray-600">
              or 4 payments of ₦
              {formatCurrency(parseFloat(product.pay_in_4_amount))}
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              BNPL not available
            </div>
          )}


            </div>
          </div>
        </div>
      </div>
    );
  };

  const isInitialLoading =
    (loadingCategories && categories.length === 0) ||
    (loadingProducts && products.length === 0);

  return (
    <div className="space-y-6 mt-8 mx-auto" style={{ width: "90%" }}>
      <div>
        <h1 className="text-3xl font-bold">Texagon Store</h1>
        <p className="text-muted-foreground">
          Purchase premium gadgets and accessories.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 mb-6 w-full">
        {/* ✅ Search input + Search button */}
        <div className="relative flex-1 flex items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
              disabled={loadingProducts}
            />
          </div>

          <Button
            type="button"
            className="bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleSearch}
            disabled={loadingProducts}
          >
            {loadingProducts ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none"
          disabled={loadingCategories}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none"
          disabled={loadingProducts}
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {isInitialLoading ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading products…</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {products.length} products
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Button */}
          {hasMore && (
            <div className="text-center">
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                size="lg"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loadingProducts}
              >
                {loadingProducts ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Load More Products"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
