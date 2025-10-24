// import useSWR, { mutate } from "swr"
// import { clientApiCall } from "@/lib/api-client-browser"

// const fetcher = (url: string) => clientApiCall(url)

// export function useAddresses() {
//   const { data, error, isLoading } = useSWR("/api/store/addresses", fetcher)

//   const createAddress = async (addressData: any) => {
//     const response = await clientApiCall("/api/store/addresses", {
//       method: "POST",
//       body: JSON.stringify(addressData),
//     })
//     mutate("/api/store/addresses")
//     return response
//   }

//   const updateAddress = async (addressId: string, addressData: any) => {
//     const response = await clientApiCall(`/api/store/addresses?id=${addressId}`, {
//       method: "PATCH",
//       body: JSON.stringify(addressData),
//     })
//     mutate("/api/store/addresses")
//     return response
//   }

//   const deleteAddress = async (addressId: string) => {
//     const response = await clientApiCall(`/api/store/addresses?id=${addressId}`, {
//       method: "DELETE",
//     })
//     mutate("/api/store/addresses")
//     return response
//   }

//   return {
//     addresses: data?.results || [],
//     error,
//     isLoading,
//     createAddress,
//     updateAddress,
//     deleteAddress,
//   }
// }

// lib/hooks/use-addresses.ts
"use client";

import {useState, useEffect} from "react";
import {fetcher} from "@/lib/utils";

export function useAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await fetcher("/api/store/addresses");
        setAddresses(data.results || []);
      } catch (err) {
        setError("Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const createAddress = async (addressData: any) => {
    const data = await fetcher("/api/store/addresses", {
      method: "POST",
      body: JSON.stringify(addressData),
    });
    const updatedAddresses = await fetcher("/api/store/addresses");
    setAddresses(updatedAddresses.results || []);
    return data;
  };

  const updateAddress = async (addressId: string, addressData: any) => {
    await fetcher(`/api/store/addresses?id=${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(addressData),
    });
    const updatedAddresses = await fetcher("/api/store/addresses");
    setAddresses(updatedAddresses.results || []);
  };

  const deleteAddress = async (addressId: string) => {
    await fetcher(`/api/store/addresses?id=${addressId}`, {method: "DELETE"});
    const updatedAddresses = await fetcher("/api/store/addresses");
    setAddresses(updatedAddresses.results || []);
  };

  return {
    addresses,
    createAddress,
    updateAddress,
    deleteAddress,
    isLoading,
    error,
  };
}
