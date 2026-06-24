// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// lib/utils.ts
import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });
  if (!res.ok)
    throw new Error((await res.json()).error || "API request failed");
  return res.json();
}

const BACKEND_URL = process.env.BASE_URL || "https://texagon-backend.onrender.com";

export function normalizeMedia(media: string | null | undefined): string | null {
  if (!media) return null;
  if (media.startsWith("http")) return media;
  const cleaned = media.replace(/^\/*(?:media\/)+|\/+$/g, "");
  return `${BACKEND_URL}/media/${cleaned}`;
}
