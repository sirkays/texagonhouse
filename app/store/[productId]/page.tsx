"use client";

import { use } from "react"
import Link from "next/link"
import { ProductDetail } from "@/components/store/product-detail"

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
]


export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const productId = parseInt(resolvedParams.productId, 10)
  const product = products.find((p) => p.id === productId)

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/store" className="text-blue-600 underline">
          Back to Store
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/store" className="text-blue-600 underline mb-4 inline-block">
        &larr; Back to Store
      </Link>
      <ProductDetail product={product} />
    </div>
  )
}
