"use client";

import {useState} from "react";
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
import {
  Search,
  Filter,
  Star,
  ShoppingCart,
  Heart,
  BookOpen,
  Video,
  Headphones,
  Package,
  Laptop,
  Grid3X3,
  List,
} from "lucide-react";

export function ProductCatalog() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
        return b.rating - a.rating;
      case "newest":
        return b.id - a.id;
      default:
        return b.reviews - a.reviews;
    }
  });

  const getDiscountPercentage = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const ProductCard = ({product}: {product: any}) => (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <div className="relative">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.bestseller && (
          <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
            Bestseller
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white">
          <Heart className="h-4 w-4" />
        </Button>
        {product.originalPrice > product.price && (
          <Badge className="absolute bottom-2 left-2 bg-red-500 text-white">
            {getDiscountPercentage(product.originalPrice, product.price)}% OFF
          </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({length: 5}).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        <div className="space-y-1">
          {product.instructor && (
            <p className="text-sm text-muted-foreground">
              by {product.instructor}
            </p>
          )}
          {product.author && (
            <p className="text-sm text-muted-foreground">by {product.author}</p>
          )}
          {product.duration && (
            <p className="text-sm text-muted-foreground">{product.duration}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.bnplAvailable && (
              <p className="text-xs text-green-600">
                or 4 payments of ${(product.price / 4).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button variant="outline">Buy Now</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Educational Store</h1>
        <p className="text-muted-foreground">
          Discover courses, books, and tools to accelerate your learning
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-1">
                <IconComponent className="h-4 w-4" />
                <span className="hidden md:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

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
      <div
        className={`grid gap-6 ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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
