// Page is done with routing

"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {toast} from "sonner";
import {
  Search,
  Filter,
  Star,
  ShoppingCart as ShoppingCartIcon,
  Heart,
  BookOpen,
  Video,
  Headphones,
  Package,
  Laptop,
  Grid3X3,
  List,
} from "lucide-react";

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

// interface ProductCatalogProps {
//   onAddToCart: (product: Product) => void;
// }
interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({onAddToCart}: ProductCatalogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      let sortParam = sortBy;
      if (sortBy === "price-low") sortParam = "price_asc";
      if (sortBy === "price-high") sortParam = "price_desc";
      if (sortBy === "rating") sortParam = "rating";
      if (sortBy === "newest") sortParam = "newest";
      if (sortBy === "popular") sortParam = "popular";

      const categoryParam =
        selectedCategory !== "all" ? `&category=${selectedCategory}` : "";

      const res = await fetch(
        `/api/store/products?q=${searchQuery}${categoryParam}&sort=${sortParam}&page_size=100`
      );
      if (!res.ok) return;
      const data = await res.json();
      const mappedProducts = data.results.results.map((p: any) => ({
        id: p.id, // uuid as string
        slug: p.slug || p.id, // Fallback to id if slug is missing
        name: p.title,
        description: p.description,
        price: parseFloat(p.price),
        category: p.category,
        type: p.type,
        rating: p.rating,
        reviews: p.rating_count,
        image: p.image,
        bnplAvailable: p.bnpl_enabled,
        // Add other fields as needed, default others
      }));
      setProducts(mappedProducts);
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  const categories = [
    {id: "all", name: "All Products", icon: Grid3X3},
    {id: "courses", name: "Online Courses", icon: Video},
    {id: "books", name: "Books & eBooks", icon: BookOpen},
    {id: "audio", name: "Audio Courses", icon: Headphones},
    {id: "hardware", name: "Hardware", icon: Laptop},
    {id: "bundles", name: "Bundles", icon: Package},
    {id: "bootcamps", name: "Bootcamps", icon: Star},
  ];

  const filteredProducts = products; // Already filtered by API

  const sortedProducts = filteredProducts; // Already sorted by API

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart(product); // This comes from CartProvider
    toast.success(`${product.name} added to cart!`);
  };

  // const ProductCard = ({product}: {product: Product}) => {
  const ProductCard = ({
    product,
    onAddToCart,
  }: {
    product: Product;
    onAddToCart: (p: Product) => void;
  }) => {
    const fullStars = Math.floor(product.rating || 0);
    const halfStar = (product.rating || 0) - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div
        onClick={() => router.push(`/store/products/${product.slug}`)}
        className="block cursor-pointer">
        <div className="relative flex flex-col gap-2 p-2 border border-transparent hover:border-gray-300 transition-shadow hover:shadow-md">
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full max-h-48 h-auto object-cover"
            />
            {/* <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer border-none"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}>
              <ShoppingCartIcon className="h-5 w-5 text-black" />
            </button> */}
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer border-none"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product); // Use prop directly
                toast.success(`${product.name} added to cart!`);
              }}>
              <ShoppingCartIcon className="h-5 w-5 text-black" />
            </button>
          </div>
          <div className="truncate text-sm font-medium">{product.name}</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {Array.from({length: 5}).map((_, i) => (
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
            <div className="flex gap-2 text-sm">
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews})</span>
            </div>
          </div>

          <div className="font-bold text-lg">${product.price}</div>
          <div className="text-xs text-gray-600">
            or 4 payments of ${(product.price / 4).toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8 mx-auto" style={{width: "90%"}}>
      <div>
        <h1 className="text-3xl font-bold">Educational Store</h1>
        <p className="text-muted-foreground">
          Discover courses, books, and tools to accelerate your learning
        </p>
      </div>

      {/* Search and Filters */}
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
          className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none">
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {sortedProducts.length} of {products.length} products
        </p>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedProducts.map((product) => (
          // <ProductCard key={product.id} product={product} />

          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Products
        </Button>
      </div>
    </div>
  );
}
