// lib/api.ts
import {getSession} from "next-auth/react";

const API_BASE_URL = "/api/store";

export async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: any,
  isFormData: boolean = false
): Promise<T> {
  const session = await getSession();
  const headers: HeadersInit = {
    Authorization: `Api-Key nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c`,
  };

  if (session?.user?.sessionToken) {
    headers["X-Session-Token"] = session.user.sessionToken;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || `API request failed: ${response.status}`
    );
  }

  return response.json();
}
