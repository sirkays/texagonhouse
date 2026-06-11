// texagon_academy\texagonui\components\store\product-catalog.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  Star,
  ShoppingCart as ShoppingCartIcon,
  Loader2,
  SlidersHorizontal,
  ChevronDown,
  Package,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function ProductCatalog() {
  const router = useRouter();
  const { addToCart } = useCart();

  // UI input value (typing does NOT trigger search)
  const [searchInput, setSearchInput] = useState("");
  // Actual query used for fetching (only updates on button click)
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Loading states
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

  // Trigger search ONLY when the button is clicked or Enter is pressed
  const handleSearch = useCallback(() => {
    setSearchQuery(searchInput.trim());
  }, [searchInput]);

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
  }, [page, searchQuery, selectedCategory, sortBy]);

  /* ─── Modern Product Card ─── */
  const ProductCard = ({ product }: { product: any }) => {
    const fullStars = Math.floor(product.rating || 0);
    const outOfStock = Number(product.stock ?? 0) <= 0;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (outOfStock) return;
          router.push(`/store/product/${product.slug}`);
        }}
        className={`
          group relative flex flex-col rounded-2xl border border-border/50
          bg-card overflow-hidden
          transition-all duration-300 ease-out
          ${outOfStock
            ? "cursor-not-allowed opacity-80"
            : "cursor-pointer hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-1 hover:border-orange-200/50"
          }
        `}
        aria-disabled={outOfStock}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.title}
            className={`
              h-full w-full object-cover
              transition-transform duration-500 ease-out
              ${outOfStock ? "blur-[2px] opacity-50 grayscale" : "group-hover:scale-110"}
            `}
          />

          {/* Gradient overlay on hover */}
          <div
            className={`
              absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
              transition-opacity duration-300
              ${isHovered && !outOfStock ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* Out of Stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                Sold Out
              </span>
            </div>
          )}

          {/* Quick actions overlay */}
          {!outOfStock && (
            <div
              className={`
                absolute bottom-3 left-3 right-3 flex items-center justify-between
                transition-all duration-300
                ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm
                  px-3 py-1.5 text-xs font-medium text-foreground shadow-lg
                  hover:bg-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/store/product/${product.slug}`);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>

              <button
                type="button"
                className="flex items-center justify-center h-9 w-9 rounded-full
                  bg-gradient-to-br from-orange-500 to-amber-500 text-white
                  shadow-lg shadow-orange-500/25
                  hover:shadow-orange-500/40 hover:scale-105
                  active:scale-95 transition-all duration-200"
                onMouseDown={(e) => e.preventDefault()}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (outOfStock) return;
                  await addToCart(product);
                  toast.success(`${product.title} added to cart`);
                }}
              >
                <ShoppingCartIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Stock badge */}
          {!outOfStock && Number(product.stock) <= 5 && Number(product.stock) > 0 && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                <TrendingUp className="h-3 w-3" />
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 gap-2">
          {/* Title */}
          <h3 className="text-sm font-semibold line-clamp-2 leading-tight text-foreground min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 transition-colors ${
                    i < fullStars
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating}
              <span className="ml-0.5">({product.rating_count})</span>
            </span>
          </div>

          {/* Price section */}
          <div className="mt-auto pt-2 space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                ₦{formatCurrency(parseFloat(product.price))}
              </span>
            </div>

            {product.bnpl_enabled ? (
              <p className="text-[11px] text-orange-600/80 font-medium">
                or 4× ₦{formatCurrency(parseFloat(product.pay_in_4_amount))}
              </p>
            ) : null}
          </div>
        </div>

        {/* Mobile-only add-to-cart (always visible on touch) */}
        {!outOfStock && (
          <div className="p-3 pt-0 sm:hidden">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl
                bg-gradient-to-r from-orange-500 to-amber-500 text-white
                py-2.5 text-xs font-semibold
                active:scale-[0.98] transition-transform"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await addToCart(product);
                toast.success(`${product.title} added to cart`);
              }}
            >
              <ShoppingCartIcon className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>
        )}
      </div>
    );
  };

  const isInitialLoading =
    (loadingCategories && categories.length === 0) ||
    (loadingProducts && products.length === 0);

  return (
    <div className="space-y-6">
      {/* ─── Filter Bar ─── */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1 flex items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-11 rounded-xl border border-border bg-card
                pl-10 pr-4 text-sm
                placeholder:text-muted-foreground/60
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20
                transition-all duration-200"
              disabled={loadingProducts}
            />
          </div>

          <Button
            type="button"
            className="h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500
              text-white font-medium shadow-md shadow-orange-500/15
              hover:shadow-lg hover:shadow-orange-500/25
              active:scale-[0.98] transition-all duration-200 border-0"
            onClick={handleSearch}
            disabled={loadingProducts}
          >
            {loadingProducts ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1 lg:flex-none">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full lg:w-48 h-11 rounded-xl border border-border bg-card
                pl-9 pr-8 text-sm appearance-none cursor-pointer
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20
                transition-all duration-200"
              disabled={loadingCategories}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex-1 lg:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full lg:w-44 h-11 rounded-xl border border-border bg-card
                pl-4 pr-8 text-sm appearance-none cursor-pointer
                focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20
                transition-all duration-200"
              disabled={loadingProducts}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="newest">Newest</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      {isInitialLoading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 blur-xl opacity-30 animate-pulse" />
            <Loader2 className="relative h-8 w-8 animate-spin text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Loading products…
          </p>
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              No products found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Product count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{products.length}</span> products
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500
                  text-white font-semibold shadow-md shadow-orange-500/15
                  hover:shadow-lg hover:shadow-orange-500/25
                  active:scale-[0.98] transition-all duration-200 border-0"
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
