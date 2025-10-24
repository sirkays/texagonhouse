// "use client"

// import { useState } from "react"
// import { useProducts, useCategories } from "@/lib/hooks/use-catalog"
// import { useCart } from "@/lib/hooks/use-cart"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Star, ShoppingCart } from "lucide-react"
// import { toast } from "sonner"

// export function ProductCatalogAPI() {
//   const [searchQuery, setSearchQuery] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState("")
//   const [sortBy, setSortBy] = useState("popular")
//   const [currentPage, setCurrentPage] = useState(1)

//   const { categories, isLoading: categoriesLoading } = useCategories()
//   const {
//     products,
//     isLoading: productsLoading,
//     pagination,
//   } = useProducts(searchQuery, selectedCategory, sortBy, currentPage)
//   const { addToCart } = useCart()

//   const handleAddToCart = async (productId: string) => {
//     try {
//       await addToCart(productId, 1)
//       toast.success("Added to cart!")
//     } catch (error) {
//       toast.error("Failed to add to cart")
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Search and Filters */}
//       <div className="space-y-4">
//         <Input
//           placeholder="Search products..."
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value)
//             setCurrentPage(1)
//           }}
//         />

//         <div className="flex gap-2 flex-wrap">
//           <select
//             value={selectedCategory}
//             onChange={(e) => {
//               setSelectedCategory(e.target.value)
//               setCurrentPage(1)
//             }}
//             className="px-3 py-2 border rounded"
//           >
//             <option value="">All Categories</option>
//             {categories.map((cat: any) => (
//               <option key={cat.id} value={cat.slug}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sortBy}
//             onChange={(e) => {
//               setSortBy(e.target.value)
//               setCurrentPage(1)
//             }}
//             className="px-3 py-2 border rounded"
//           >
//             <option value="popular">Popular</option>
//             <option value="rating">Highest Rated</option>
//             <option value="price_asc">Price: Low to High</option>
//             <option value="price_desc">Price: High to Low</option>
//             <option value="newest">Newest</option>
//           </select>
//         </div>
//       </div>

//       {/* Products Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {productsLoading ? (
//           <div className="col-span-full text-center py-8">Loading products...</div>
//         ) : products.length === 0 ? (
//           <div className="col-span-full text-center py-8">No products found</div>
//         ) : (
//           products.map((product: any) => (
//             <Card key={product.id}>
//               <CardHeader>
//                 <img
//                   src={product.image || "/placeholder.svg"}
//                   alt={product.title}
//                   className="w-full h-40 object-cover rounded mb-2"
//                 />
//                 <CardTitle className="line-clamp-2">{product.title}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-2xl font-bold">${product.price}</span>
//                   <Badge>{product.type}</Badge>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <div className="flex">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-4 w-4 ${
//                           i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-gray-600">({product.rating_count})</span>
//                 </div>

//                 {product.bnpl_enabled && <Badge variant="secondary">BNPL Available</Badge>}

//                 <Button className="w-full" onClick={() => handleAddToCart(product.id)}>
//                   <ShoppingCart className="mr-2 h-4 w-4" />
//                   Add to Cart
//                 </Button>
//               </CardContent>
//             </Card>
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination?.next || pagination?.previous ? (
//         <div className="flex justify-center gap-2">
//           <Button disabled={!pagination?.previous} onClick={() => setCurrentPage(currentPage - 1)}>
//             Previous
//           </Button>
//           <span className="px-4 py-2">Page {currentPage}</span>
//           <Button disabled={!pagination?.next} onClick={() => setCurrentPage(currentPage + 1)}>
//             Next
//           </Button>
//         </div>
//       ) : null}
//     </div>
//   )
// }

// components/store/product-catalog-api.tsx
"use client";

import {useState} from "react";
import {useProducts, useCategories} from "@/lib/hooks/use-catalog";
import {useCart} from "@/lib/hooks/use-cart";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Star, ShoppingCart} from "lucide-react";
import {toast} from "sonner";

export function ProductCatalogAPI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const {categories, isLoading: categoriesLoading} = useCategories();
  const {
    products,
    isLoading: productsLoading,
    pagination,
  } = useProducts(searchQuery, selectedCategory, sortBy, currentPage);
  const {addToCart} = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded">
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded">
            <option value="popular">Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productsLoading ? (
          <div className="col-span-full text-center py-8">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8">
            No products found
          </div>
        ) : (
          products.map((product: any) => (
            <Card key={product.id}>
              <CardHeader>
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <CardTitle className="line-clamp-2">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${product.price}</span>
                  <Badge>{product.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
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
                  <span className="text-sm text-gray-600">
                    ({product.rating_count})
                  </span>
                </div>
                {product.bnpl_enabled && (
                  <Badge variant="secondary">BNPL Available</Badge>
                )}
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product.id)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {pagination?.next || pagination?.previous ? (
        <div className="flex justify-center gap-2">
          <Button
            disabled={!pagination?.previous}
            onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </Button>
          <span className="px-4 py-2">Page {currentPage}</span>
          <Button
            disabled={!pagination?.next}
            onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
