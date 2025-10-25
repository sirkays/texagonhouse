"use client";

import {useState} from "react";
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

interface ProductCatalogProps {
  onAddToCart: (product: Product) => void;
}

export function ProductCatalog({onAddToCart}: ProductCatalogProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const products = [
    {
      id: 1,
      name: "Complete React Development Course",
      description:
        "Master React from basics to advanced concepts with hands-on projects",
      price: 89.99,
      originalPrice: 129.99,
      category: "courses",
      type: "digital",
      rating: 4.8,
      reviews: 2847,
      image: "/placeholder.svg?height=200&width=300",
      instructor: "Sarah Chen",
      duration: "40 hours",
      students: 15420,
      bestseller: true,
      bnplAvailable: true,
    },
    {
      id: 2,
      name: "Python Programming Textbook",
      description:
        "Comprehensive guide to Python programming with practical examples",
      price: 45.99,
      originalPrice: 59.99,
      category: "books",
      type: "physical",
      rating: 4.6,
      reviews: 1234,
      image: "/placeholder.svg?height=200&width=300",
      author: "Dr. Michael Johnson",
      pages: 650,
      publisher: "TechBooks",
      inStock: true,
      bnplAvailable: true,
    },
    {
      id: 3,
      name: "JavaScript Fundamentals Audio Course",
      description:
        "Learn JavaScript on-the-go with this comprehensive audio course",
      price: 29.99,
      originalPrice: 39.99,
      category: "audio",
      type: "digital",
      rating: 4.5,
      reviews: 892,
      image: "/placeholder.svg?height=200&width=300",
      narrator: "Alex Rodriguez",
      duration: "12 hours",
      episodes: 24,
      bnplAvailable: false,
    },
    {
      id: 4,
      name: "Programming Laptop - Student Edition",
      description:
        "High-performance laptop optimized for coding and development",
      price: 899.99,
      originalPrice: 1199.99,
      category: "hardware",
      type: "physical",
      rating: 4.7,
      reviews: 456,
      image: "/placeholder.svg?height=200&width=300",
      brand: "TechPro",
      specs: "Intel i7, 16GB RAM, 512GB SSD",
      warranty: "2 years",
      inStock: true,
      bnplAvailable: true,
    },
    {
      id: 5,
      name: "Data Science Toolkit",
      description:
        "Complete toolkit with books, software licenses, and project templates",
      price: 199.99,
      originalPrice: 299.99,
      category: "bundles",
      type: "mixed",
      rating: 4.9,
      reviews: 678,
      image: "/placeholder.svg?height=200&width=300",
      includes: "3 Books, 5 Software Licenses, 20 Templates",
      value: "$500+",
      bnplAvailable: true,
    },
    {
      id: 6,
      name: "Web Development Bootcamp",
      description: "Intensive 12-week bootcamp covering full-stack development",
      price: 2499.99,
      originalPrice: 3499.99,
      category: "bootcamps",
      type: "service",
      rating: 4.9,
      reviews: 234,
      image: "/placeholder.svg?height=200&width=300",
      duration: "12 weeks",
      format: "Live Online",
      jobGuarantee: true,
      bnplAvailable: true,
    },
  ];

  const categories = [
    {id: "all", name: "All Products", icon: Grid3X3},
    {id: "courses", name: "Online Courses", icon: Video},
    {id: "books", name: "Books & eBooks", icon: BookOpen},
    {id: "audio", name: "Audio Courses", icon: Headphones},
    {id: "hardware", name: "Hardware", icon: Laptop},
    {id: "bundles", name: "Bundles", icon: Package},
    {id: "bootcamps", name: "Bootcamps", icon: Star},
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "newest":
        return b.id - a.id;
      default:
        return (b.reviews ?? 0) - (a.reviews ?? 0);
    }
  });

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const ProductCard = ({
    product,
    onAddToCart,
  }: {
    product: Product;
    onAddToCart: (product: Product) => void;
  }) => {
    const fullStars = Math.floor(product.rating || 0);
    const halfStar = (product.rating || 0) - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div
        onClick={() => router.push(`/store/${product.id}`)}
        className="block cursor-pointer">
        <div className="relative flex flex-col gap-2 p-2 border border-transparent hover:border-gray-300 transition-shadow hover:shadow-md">
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full max-h-48 h-auto object-cover"
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer border-none"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
                toast.success(`${product.name} has been added to your cart.`);
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
