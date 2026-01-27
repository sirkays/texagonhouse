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

// lib/api.ts
export const createAccount = async (data: any, apiKey: string) => {
  const res = await fetch(
    `${process.env.BASE_URL}/accounts/api/account/create/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        account_type: data.account_type || "teacher",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create account");
  }
  return res.json();
};

export const verifyOTP = async (
  email: string,
  code: string,
  apiKey: string
) => {
  const res = await fetch(
    `${process.env.BASE_URL}/accounts/api/auth/verify-email/`,
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email, code}),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Invalid or expired OTP");
  }
  return res.json();
};
