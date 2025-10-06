"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import DashboardLayout from "@/app/admin/layout";
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
import {Plus, Search, ShoppingCart, Edit, Eye, Star} from "lucide-react";
import {ProductModal} from "@/components/admin/modals/product-modal";
import {OrderDetailsModal} from "@/components/admin/modals/order-details-modal";
import {useToast} from "@/hooks/use-toast";

export default function StorePage() {
  const router = useRouter();
  const {toast} = useToast();
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Complete React Development Course",
      description: "Master React from basics to advanced concepts",
      sku: "COURSE-001",
      category: "Courses",
      price: 89.99,
      salePrice: null,
      stock: 999,
      rating: 4.8,
      reviews: 2847,
      isDigital: true,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=react course",
    },
    {
      id: 2,
      title: "Scientific Calculator Pro",
      description: "Advanced scientific calculator for students",
      sku: "CALC-001",
      category: "Electronics",
      price: 29.99,
      salePrice: null,
      stock: 45,
      rating: 4.5,
      reviews: 1234,
      isDigital: false,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=calculator",
    },
    {
      id: 3,
      title: "Chemistry Lab Kit Premium",
      description: "Complete chemistry lab equipment set",
      sku: "LAB-002",
      category: "Lab Equipment",
      price: 149.99,
      salePrice: 129.99,
      stock: 12,
      rating: 4.9,
      reviews: 567,
      isDigital: false,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=chemistry lab",
    },
    {
      id: 4,
      title: "Digital Textbook Bundle",
      description: "Complete digital textbook collection",
      sku: "BOOK-003",
      category: "Books",
      price: 99.99,
      salePrice: null,
      stock: 999,
      rating: 4.7,
      reviews: 3421,
      isDigital: true,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=textbooks",
    },
    {
      id: 5,
      title: "Professional Geometry Set",
      description: "High-quality geometry tools for students",
      sku: "GEO-004",
      category: "Stationery",
      price: 15.99,
      salePrice: null,
      stock: 78,
      rating: 4.6,
      reviews: 892,
      isDigital: false,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=geometry set",
    },
    {
      id: 6,
      title: "Premium School Uniform Set",
      description: "Complete school uniform package",
      sku: "UNI-006",
      category: "Apparel",
      price: 79.99,
      salePrice: 69.99,
      stock: 23,
      rating: 4.4,
      reviews: 456,
      isDigital: false,
      isActive: true,
      image: "/.jpg?height=300&width=300&query=school uniform",
    },
  ]);

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      customer: "John Doe",
      items: 3,
      total: 245.97,
      status: "fulfilled",
      date: "2024-03-15",
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      customer: "Sarah Smith",
      items: 1,
      total: 29.99,
      status: "paid",
      date: "2024-03-16",
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      customer: "Mike Johnson",
      items: 2,
      total: 179.98,
      status: "pending",
      date: "2024-03-17",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveProduct = (product: any) => {
    if (editingProduct) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
      toast({title: "Success", description: "Product updated successfully"});
    } else {
      setProducts([...products, product]);
      toast({title: "Success", description: "Product added successfully"});
    }
    setEditingProduct(null);
  };

  const handleAddToCart = (product: any) => {
    setCart([...cart, product]);
    toast({
      title: "Added to Cart",
      description: `${product.title} added to cart`,
    });
  };

  const handleGoToCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart first",
        variant: "destructive",
      });
      return;
    }
    router.push("/admin/store/checkout");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "fill-none text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled":
        return "default";
      case "paid":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Store
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage products and orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGoToCheckout}
              className="relative bg-transparent">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cart.length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                234
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+12</span> this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                1,429
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+89</span> this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                $34,521
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+18%</span> from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Avg Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-foreground">
                $24.15
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-accent">+5%</span> increase
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex gap-2 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid - Replicated design from image.png with mobile-first responsive cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Cart Button - positioned like in the image */}
                  <Button
                    size="icon"
                    className="absolute bottom-3 right-3 h-12 w-12 rounded-full shadow-lg bg-white hover:bg-white/90 text-foreground"
                    onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                  {/* Edit Button */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 h-9 w-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsProductModalOpen(true);
                    }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  {/* Title */}
                  <h3 className="font-medium text-sm md:text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    {renderStars(product.rating)}
                  </div>

                  {/* Rating Score and Reviews */}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-semibold">{product.rating}</span>
                    <span className="text-muted-foreground">
                      ({product.reviews.toLocaleString()})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="pt-1">
                    {product.salePrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl md:text-2xl font-bold text-foreground">
                          ${product.salePrice}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl md:text-2xl font-bold text-foreground">
                        ${product.price}
                      </span>
                    )}
                  </div>

                  {/* Payment Option - like in the image */}
                  <p className="text-xs md:text-sm text-muted-foreground">
                    or 4 payments of ${(product.salePrice || product.price) / 4}
                  </p>

                  {/* Stock Badge */}
                  <div className="pt-2">
                    <Badge
                      variant={
                        product.stock > 20
                          ? "default"
                          : product.stock > 0
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs">
                      {product.isDigital
                        ? "Digital"
                        : `${product.stock} in stock`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders - Mobile-first responsive with card view on mobile, table on desktop */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Orders</CardTitle>
            <CardDescription>Latest customer purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-3">
              {recentOrders.map((order) => (
                <Card key={order.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">
                          {order.orderNumber}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.customer}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="capitalize text-xs">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="font-medium">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{order.date}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => setViewingOrder(order)}>
                      <Eye className="mr-2 h-3 w-3" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {order.orderNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.customer} • {order.items} items • {order.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </p>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="mt-1 capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
      <OrderDetailsModal
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
        order={viewingOrder}
      />
    </>
  );
}
