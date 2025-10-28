"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Star,
  ShoppingCart as ShoppingCartIcon,
  Video,
  BookOpen,
  Headphones,
  Package,
  Laptop,
  Grid3X3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  slug: string;
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

type CatalogAddPayload = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  type?: string;
  originalPrice?: number;
  bnplAvailable?: boolean;
  instructor?: string;
  author?: string;
  brand?: string;
};

interface ProductCatalogProps {
  // IMPORTANT: Provider will do the API call. This component won't.
  onAddToCart: (product: CatalogAddPayload) => Promise<void>;
}

export default function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Local per-product disable to prevent spam clicks on the UI
  const inFlightRef = useRef<Set<string>>(new Set());
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        setLoading(true);

        let sortParam = sortBy;
        if (sortBy === "price-low") sortParam = "price_asc";
        if (sortBy === "price-high") sortParam = "price_desc";
        if (sortBy === "rating") sortParam = "rating";
        if (sortBy === "newest") sortParam = "newest";
        if (sortBy === "popular") sortParam = "popular";

        const categoryParam =
          selectedCategory !== "all" ? `&category=${selectedCategory}` : "";

        const res = await fetch(
          `/api/store/products?q=${encodeURIComponent(
            searchQuery
          )}${categoryParam}&sort=${sortParam}&page_size=100`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          setProducts([]);
          return;
        }

        const data = await res.json();
        const mappedProducts = (data?.results?.results ?? []).map((p: any) => ({
          id: p.id,
          slug: p.slug || p.id,
          name: p.title,
          description: p.description,
          price: parseFloat(p.price),
          category: p.category,
          type: p.type,
          rating: p.rating,
          reviews: p.rating_count,
          image: p.image,
          bnplAvailable: p.bnpl_enabled,
        })) as Product[];

        setProducts(mappedProducts);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error(err);
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [searchQuery, selectedCategory, sortBy]);

  const categories = [
    { id: "all", name: "All Products", icon: Grid3X3 },
    { id: "courses", name: "Online Courses", icon: Video },
    { id: "books", name: "Books & eBooks", icon: BookOpen },
    { id: "audio", name: "Audio Courses", icon: Headphones },
    { id: "hardware", name: "Hardware", icon: Laptop },
    { id: "bundles", name: "Bundles", icon: Package },
    { id: "bootcamps", name: "Bootcamps", icon: Grid3X3 },
  ];

  const filteredProducts = products;
  const sortedProducts = filteredProducts;

  const handleAddClick = async (p: Product) => {
    const key = p.id;
    if (inFlightRef.current.has(key)) return;

    inFlightRef.current.add(key);
    setAdding((s) => ({ ...s, [key]: true }));

    try {
      // Delegate to provider (the ONLY place that hits the API)
      await onAddToCart({
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.image,
        type: p.type,
        originalPrice: p.originalPrice,
        bnplAvailable: p.bnplAvailable,
        instructor: p.instructor,
        author: p.author,
        brand: p.brand,
      });
      // toast is handled in provider too; it's OK to keep a local one if you prefer
      // toast.success(`${p.name} added to cart!`);
    } catch (e: any) {
      console.error("[ProductCatalog] addToCart error:", e);
      toast.error(e?.message || "Could not add to cart");
    } finally {
      inFlightRef.current.delete(key);
      setAdding((s) => ({ ...s, [key]: false }));
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    return (
      <div
        onClick={() => router.push(`/store/products/${product.slug}`)}
        className="block cursor-pointer"
      >
        <div className="flex items-center gap-4 p-3 border border-transparent hover:border-gray-300 hover:shadow-md transition-shadow rounded-md min-h-36 sm:minh-40">
          {/* Image */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover rounded-md"
            />
            <button
              type="button"
              className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!adding[product.id]) handleAddClick(product);
              }}
              disabled={!!adding[product.id]}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCartIcon className="h-4 w-4 text-black" />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{product.name}</div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                ({product.reviews ?? 0})
              </span>
            </div>

            <div className="font-bold text-base">
              ₦{Number(product.price).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProductSkeletonCard = () => (
    <div className="block">
      <div className="flex items-center gap-4 p-3 border border-transparent rounded-md min-h-36 sm:min-h-40">
        <Skeleton className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-md" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded" />
            ))}
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );

  const skeletonCount = 10;

  return (
    <div className="space-y-6 mt-8 mx-auto" style={{ width: "90%" }}>
      <div>
        <h1 className="text-3xl font-bold">Store</h1>
        <p className="text-muted-foreground">
          Discover courses, books, and tools to accelerate your learning
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mt-4 mb-6 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none"
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
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Results Count + Filters */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {loading
            ? "Loading products…"
            : `Showing ${sortedProducts.length} of ${products.length} products`}
        </p>
        <Button variant="outline" size="sm" disabled={loading}>
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductSkeletonCard key={`skeleton-${i}`} />
            ))
          : sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* Empty */}
      {!loading && sortedProducts.length === 0 && (
        <div className="text-center text-muted-foreground py-10">
          No products found. Try adjusting your search or filters.
        </div>
      )}

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg" disabled={loading}>
          {loading ? "Loading…" : "Load More Products"}
        </Button>
      </div>
    </div>
  );
}
