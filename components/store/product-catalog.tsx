"use client"

import { useState } from "react"
import { useCatalog } from "@/lib/hooks/use-catalog"
import { useCart } from "@/lib/hooks/use-cart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, ShoppingCart } from "lucide-react"

export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [currentPage, setCurrentPage] = useState(1)

  const { products, categories, isLoading, error } = useCatalog({
    search: searchTerm,
    sort: sortBy,
    page: currentPage,
  })

  const { addItem, isLoading: isAddingToCart } = useCart()

  const handleAddToCart = async (productId: string, quantity = 1) => {
    try {
      await addItem(productId, quantity)
    } catch (err) {
      console.error("[v0] Failed to add to cart:", err)
    }
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading products: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge key={category.id} variant="outline">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${product.price}</span>
                  {product.discount && <Badge variant="secondary">{product.discount}% off</Badge>}
                </div>
                <Button onClick={() => handleAddToCart(product.id)} disabled={isAddingToCart} className="w-full">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  )
}
