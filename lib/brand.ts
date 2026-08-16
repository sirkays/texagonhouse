export type BrandType = "techxagon" | "nimet";

export interface BrandConfig {
  id: BrandType;
  name: string;
  fullName: string;
  shortName: string;
  tagline: string;
  subTagline: string;
  metaTitle: string;
  metaDescription: string;
  logo: string;
  logoAlt: string;
  logoWidth?: number;
  logoHeight?: number;
  favicon: string;
  domain: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  copyright: string;
  bannerSubtitle?: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  colors: {
    primary: string;
    primaryHover: string;
    accent: string;
    dark: string;
    lightBg: string;
  };
}

export const BRAND_CONFIGS: Record<BrandType, BrandConfig> = {
  techxagon: {
    id: "techxagon",
    name: "Techxagon",
    fullName: "Techxagon Academy",
    shortName: "Techxagon",
    tagline: "Readying the Future",
    subTagline: "Pioneering 4IR Education for Africa",
    metaTitle: "Techxagon Educational Platform",
    metaDescription:
      "A video conferencing and educational platform to help students learn and teachers teach.",
    logo: "/logo.png",
    logoAlt: "TechXagon Logo",
    logoWidth: 64,
    logoHeight: 64,
    favicon: "/favicon.ico",
    domain: "techxagonacademy.com",
    supportEmail: "info@techxagonacademy.com",
    supportPhone: "+234 800 000 0000",
    address: "Lagos, Nigeria",
    copyright: `© ${new Date().getFullYear()} Techxagon Academy. All rights reserved.`,
    bannerSubtitle: "Africa's Foremost 4IR Curriculum",
    socialLinks: {
      twitter: "https://twitter.com/techxagon",
      facebook: "https://facebook.com/techxagon",
      linkedin: "https://linkedin.com/company/techxagon",
    },
    colors: {
      primary: "#18181b",
      primaryHover: "#27272a",
      accent: "#f43f5e",
      dark: "#09090b",
      lightBg: "#fafafa",
    },
  },
  nimet: {
    id: "nimet",
    name: "NiMet",
    fullName: "Nigerian Meteorological Agency",
    shortName: "NiMet",
    tagline: "Authoritative Weather & Climate Services",
    subTagline: "Providing accurate and timely weather and climate information",
    metaTitle: "NiMet Learning & Training Portal",
    metaDescription:
      "Official Learning & Training Portal for the Nigerian Meteorological Agency (NiMet) — delivering world-class meteorological training and educational services.",
    logo: "/nimet-logo.png",
    logoAlt: "NiMet Logo",
    logoWidth: 140,
    logoHeight: 48,
    favicon: "/nimet-favicon.png",
    domain: "nimet.gov.ng",
    supportEmail: "info@nimet.gov.ng",
    supportPhone: "+234 9 291 9437",
    address: "National Weather Forecasting & Climate Research Centre, Bill Clinton Drive, Nnamdi Azikiwe International Airport, Abuja, Nigeria",
    copyright: `© ${new Date().getFullYear()} Nigerian Meteorological Agency (NiMet). All rights reserved.`,
    bannerSubtitle: "Excellence in Meteorological Science & Training",
    socialLinks: {
      twitter: "https://twitter.com/Nimetnigeria",
      facebook: "https://facebook.com/nimetnigeria",
      linkedin: "https://linkedin.com/company/nimetnigeria",
      youtube: "https://youtube.com/@nimetnigeria",
    },
    colors: {
      primary: "#006B3E", // NiMet Forest Green
      primaryHover: "#005230",
      accent: "#FFC931", // NiMet Gold
      dark: "#071a47", // NiMet Navy
      lightBg: "#F1F8FF",
    },
  },
};

/**
 * Gets the active brand identifier from NEXT_PUBLIC_APP_BRAND environment variable.
 * Defaults to 'techxagon'.
 */
export function getActiveBrandId(): BrandType {
  const brand = (process.env.NEXT_PUBLIC_APP_BRAND || "techxagon").toLowerCase().trim();
  if (brand === "nimet") {
    return "nimet";
  }
  return "techxagon";
}

/**
 * Retrieves the active BrandConfig object.
 */
export function getBrandConfig(): BrandConfig {
  const id = getActiveBrandId();
  return BRAND_CONFIGS[id] || BRAND_CONFIGS.techxagon;
}

export const brand = getBrandConfig();
