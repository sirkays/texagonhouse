// // components/store/product-catalog.tsx
// "use client";

// import {useEffect, useState} from "react";
// import {useRouter} from "next/navigation";
// import {Button} from "@/components/ui/button";
// import {Badge} from "@/components/ui/badge";
// import {Input} from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {toast} from "sonner";
// import {Search, Star, ShoppingCart as ShoppingCartIcon} from "lucide-react";
// import {useCart} from "@/providers/CartProvider";

// export function ProductCatalog() {
//   const router = useRouter();
//   const {addToCart} = useCart();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [sortBy, setSortBy] = useState("popular");
//   const [products, setProducts] = useState<any[]>([]);
//   const [categories, setCategories] = useState<any[]>([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const res = await fetch("/api/store/categories");
//       if (res.ok) {
//         const data = await res.json();
//         setCategories([
//           {id: "all", name: "All Products"},
//           ...data.results.map((c: any) => ({id: c.slug, name: c.name})),
//         ]);
//       } else if (res.status === 401) {
//         router.push("/login");
//       }
//     };
//     fetchCategories();
//   }, [router]);

//   useEffect(() => {
//     setProducts([]);
//     setPage(1);
//     setHasMore(true);
//   }, [searchQuery, selectedCategory, sortBy]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const params = new URLSearchParams();
//       if (searchQuery) params.append("q", searchQuery);
//       if (selectedCategory !== "all")
//         params.append("category", selectedCategory);
//       let sort = sortBy;
//       if (sortBy === "price-low") sort = "price_asc";
//       if (sortBy === "price-high") sort = "price_desc";
//       if (sortBy === "rating") sort = "rating";
//       if (sortBy === "newest") sort = "newest";
//       params.append("sort", sort);
//       params.append("page", page.toString());
//       params.append("page_size", "20");
//       const res = await fetch(`/api/store/products?${params.toString()}`);
//       if (res.ok) {
//         const data = await res.json();
//         setProducts((prev) => [...prev, ...data.results.results]);
//         setHasMore(!!data.next);
//       } else if (res.status === 401) {
//         router.push("/login");
//       }
//     };
//     if (hasMore) fetchProducts();
//   }, [page, searchQuery, selectedCategory, sortBy, hasMore, router]);

//   const ProductCard = ({product}: {product: any}) => {
//     const fullStars = Math.floor(product.rating || 0);

//     return (
//       <div
//         onClick={() => router.push(`/store/${product.slug}`)}
//         className="block cursor-pointer">
//         <div className="relative flex flex-col gap-2 p-2 border border-transparent hover:border-gray-300 transition-shadow hover:shadow-md">
//           <div className="relative">
//             <img
//               src={product.image || "/placeholder.svg"}
//               alt={product.name}
//               className="w-full max-h-48 h-auto object-cover"
//             />
//             <button
//               type="button"
//               className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 cursor-pointer border-none"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 addToCart(product);
//                 toast.success(`${product.name} has been added to your cart.`);
//               }}>
//               <ShoppingCartIcon className="h-5 w-5 text-black" />
//             </button>
//           </div>
//           <div className="truncate text-sm font-medium">{product.name}</div>
//           <div className="flex flex-col gap-1">
//             <div className="flex items-center gap-2">
//               {Array.from({length: 5}).map((_, i) => (
//                 <Star
//                   key={i}
//                   className={`h-4 w-4 ${
//                     i < fullStars
//                       ? "fill-yellow-400 text-yellow-400"
//                       : "text-gray-300"
//                   }`}
//                 />
//               ))}
//             </div>
//             <div className="flex gap-2 text-sm">
//               <span className="font-medium">{product.rating}</span>
//               <span className="text-muted-foreground">({product.reviews})</span>
//             </div>
//           </div>

//           {/* <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
//           <div className="text-xs text-gray-600">
//             or 4 payments of ${(product.price / 4).toFixed(2)}
//           </div> */}

//           <div className="font-bold text-lg">
//             ${parseFloat(product.price).toFixed(2)}
//           </div>
//           <div className="text-xs text-gray-600">
//             or 4 payments of ${(parseFloat(product.price) / 4).toFixed(2)}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 mt-8 mx-auto" style={{width: "90%"}}>
//       <div>
//         <h1 className="text-3xl font-bold">Educational Store</h1>
//         <p className="text-muted-foreground">
//           Discover courses, books, and tools to accelerate your learning
//         </p>
//       </div>

//       <div className="flex flex-col md:flex-row gap-4 mt-4 mb-6 w-full">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
//           />
//         </div>
//         <select
//           value={selectedCategory}
//           onChange={(e) => setSelectedCategory(e.target.value)}
//           className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none">
//           {categories.map((category) => (
//             <option key={category.id} value={category.id}>
//               {category.name}
//             </option>
//           ))}
//         </select>
//         <select
//           value={sortBy}
//           onChange={(e) => setSortBy(e.target.value)}
//           className="w-full md:w-48 rounded-md border border-gray-300 bg-white py-2 px-3 focus:border-blue-500 focus:outline-none">
//           <option value="popular">Most Popular</option>
//           <option value="rating">Highest Rated</option>
//           <option value="price-low">Price: Low to High</option>
//           <option value="price-high">Price: High to Low</option>
//           <option value="newest">Newest</option>
//         </select>
//       </div>

//       <div className="flex items-center justify-between">
//         <p className="text-muted-foreground">
//           Showing {products.length} products
//         </p>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {/* {products.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))} */}

//         {products.map((product, index) => (
//           <ProductCard key={`${product.id}-${index}`} product={product} />
//         ))}
//       </div>

//       {hasMore && (
//         <div className="text-center">
//           <Button
//             className="bg-orange-500 text-white hover:bg-orange-600"
//             size="lg"
//             onClick={() => setPage(page + 1)}>
//             Load More Products
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Search, Star, ShoppingCart as ShoppingCartIcon} from "lucide-react";
import {useCart} from "@/providers/CartProvider";

export function ProductCatalog() {
  const router = useRouter();
  const {addToCart} = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/store/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories([
          {id: "all", name: "All Products"},
          ...data.results.map((c: any) => ({id: c.slug, name: c.name})),
        ]);
      } else if (res.status === 401) {
        router.push("/login");
      }
    };
    fetchCategories();
  }, [router]);

  // Reset product list when filters/search/sort change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [searchQuery, selectedCategory, sortBy]);

  // Fetch products (with deduplication)
  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      let sort = sortBy;
      if (sortBy === "price-low") sort = "price_asc";
      if (sortBy === "price-high") sort = "price_desc";
      if (sortBy === "rating") sort = "rating";
      if (sortBy === "newest") sort = "newest";

      params.append("sort", sort);
      params.append("page", page.toString());
      params.append("page_size", "20");

      const res = await fetch(`/api/store/products?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        return;
      }

      const data = await res.json();

      if (isCancelled) return;

      setProducts((prev) => {
        const combined = [...prev, ...data.results.results];
        // ✅ Remove duplicates by product ID
        const unique = Array.from(
          new Map(combined.map((p) => [p.id, p])).values()
        );
        return unique;
      });

      setHasMore(Boolean(data.next));
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [page, searchQuery, selectedCategory, sortBy, router]);

  // Component for each product card
  const ProductCard = ({product}: {product: any}) => {
    const fullStars = Math.floor(product.rating || 0);

    return (
      <div
        onClick={() => router.push(`/store/${product.slug}`)}
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
                addToCart(product);
                toast.success(`${product.title} has been added to your cart.`);
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
                    i < fullStars
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

          <div className="font-bold text-lg">
            ${parseFloat(product.price).toFixed(2)}
          </div>
          <div className="text-xs text-gray-600">
            or 4 payments of ${(parseFloat(product.price) / 4).toFixed(2)}
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

      {/* Filters */}
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

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {products.length} products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination Button */}
      {hasMore && (
        <div className="text-center">
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            size="lg"
            onClick={() => setPage((prev) => prev + 1)}>
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
