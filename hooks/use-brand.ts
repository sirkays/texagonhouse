"use client";

import { useMemo } from "react";
import { getBrandConfig, getActiveBrandId, BrandConfig, BrandType } from "@/lib/brand";

export function useBrand(): BrandConfig & { isNiMet: boolean; isTechxagon: boolean } {
  return useMemo(() => {
    const brand = getBrandConfig();
    const brandId = getActiveBrandId();
    return {
      ...brand,
      isNiMet: brandId === "nimet",
      isTechxagon: brandId === "techxagon",
    };
  }, []);
}

export default useBrand;
