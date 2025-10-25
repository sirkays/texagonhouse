"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { useCart } from "@/providers/CartProvider"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  category?: string
  type?: string
  rating?: number
  reviews?: number
  image?: string
  instructor?: string
  duration?: string
  students?: number
  bestseller?: boolean
  bnplAvailable?: boolean
  author?: string
  brand?: string
  pages?: number
  publisher?: string
  specs?: string
  warranty?: string
  inStock?: boolean
  narrator?: string
  episodes?: number
  includes?: string
  value?: string
  format?: string
  jobGuarantee?: boolean
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { addToCart, setCartItems, setBuyNowProduct } = useCart()

  const incrementQuantity = () => setQuantity((q) => q + 1)
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1))

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} added to cart!`)
  }

  const handleBuyNow = () => {
    setBuyNowProduct({ ...product, quantity })
    router.push('/store/checkout')
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Product Image */}
        <div className="flex-1">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full max-w-md object-contain rounded-lg border"
          />
        </div>

        {/* Right: Product Details */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Title and Rating */}
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
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
              <span className="font-semibold">{product.rating?.toFixed(1) || "N/A"}</span>
              <span className="text-gray-600">{product.reviews ?? 0} Reviews</span>

            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-3xl font-extrabold text-red-600">${product.price.toFixed(2)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">${product.originalPrice.toFixed(2)}</p>
            )}
            <p className="text-xs text-gray-400">or 4 payments of ${(product.price / 4).toFixed(2)}</p>
          </div>

          {/* Additional Info */}
          {product.category && (
            <div>
              <strong>Category:</strong> {product.category}
            </div>
          )}
          {product.description && (
            <div>
              <strong>Description:</strong> {product.description}
            </div>
          )}
          {product.instructor && (
            <div>
              <strong>Instructor:</strong> {product.instructor}
            </div>
          )}
          {product.author && (
            <div>
              <strong>Author:</strong> {product.author}
            </div>
          )}
          {product.duration && (
            <div>
              <strong>Duration:</strong> {product.duration}
            </div>
          )}
          {product.brand && (
            <div>
              <strong>Brand:</strong> {product.brand}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 mt-4">
            <span className="font-semibold">Quantity</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={decrementQuantity}
                disabled={quantity === 1}
                className="px-3 py-1 text-lg font-bold disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="px-4 py-1 text-lg font-semibold">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-3 py-1 text-lg font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={handleBuyNow}
              className="bg-red-600 text-white py-3 px-6 rounded font-semibold hover:bg-red-700 transition"
            >
              Buy now
            </button>
            <button
              onClick={handleAddToCart}
              className="border border-gray-700 py-3 px-6 rounded font-semibold hover:bg-gray-100 transition"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
