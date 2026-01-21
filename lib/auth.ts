// texagon_academy\texagonui\lib\auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

//const BASE_URL = "http://127.0.0.1:9098"
const BASE_URL = "https://texagonbackend.onrender.com";
const API_KEY = "nQtqkj8a.TWzuxiAAwrlsUXO8yJm2FPFWbEc5Gb7c";

const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Step 1: Login
          const loginResponse = await fetch(`${BASE_URL}/api/auth/login/`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const loginRaw = await loginResponse.text();
          let loginData;
          try {
            loginData = JSON.parse(loginRaw);
          } catch {
            throw new Error(
              `Invalid login response: ${loginRaw.slice(0, 100)}...`
            );
          }

          if (!loginResponse.ok) {
            const code = (loginData?.code || "").toString().toLowerCase();

            // map backend codes to stable frontend codes
            if (code === "past_due") throw new Error("past_due");
            if (code === "missing") throw new Error("subscription_missing");
            if (code === "expired" || code === "expired_by_date") throw new Error("subscription_expired");
            if (code === "cancelled") throw new Error("subscription_cancelled");

            // fallback
            throw new Error(loginData?.detail || "login_failed");
          }

          const sessionToken = loginData.sessionToken;
          if (!sessionToken) {
            throw new Error("No session token returned by login API");
          }

          // Step 2: Post-login check
          const url = new URL(`${BASE_URL}/accounts/api/post-login/`);

          const response = await fetch(url, {
            method: "GET",
            headers: headers(sessionToken),
          });

          const rawPostLogin = await response.text();
          let data;
          try {
            data = JSON.parse(rawPostLogin);
          } catch {
            throw new Error(
              `Invalid post-login response: ${rawPostLogin.slice(0, 100)}...`
            );
          }

          if (
            !response.ok ||
            data.detail !== "User access granted" ||
            !data.role
          ) {
            throw new Error(data.detail || "User access not granted");
          }

          return {
            id: data.org_membership_pk || credentials.email,
            email: credentials.email,
            name: credentials.email.split("@")[0],
            role: data.role,
            sessionToken,
            expiresAt: loginData.expiresAt,
          };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Authentication failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.sessionToken = (user as any).sessionToken;
        token.expiresAt = (user as any).expiresAt;
      }
      if (token.expiresAt && new Date(token.expiresAt as string) < new Date()) {
        return {} as JWT; // Return empty JWT instead of null
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token || !token.sessionToken) {
        return { ...session, user: undefined, expires: new Date().toISOString() };
      }
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).sessionToken = token.sessionToken;
        (session.user as any).expiresAt = token.expiresAt;
      }
      return session;
    },
  },

  secret: "aVeryStrongSecretKeyAtLeast32Chars",

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 4 * 60 * 60, // Check session every 4 hours instead of default (0)
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  events: {
    async signOut(message) {
      console.log("[Auth] User signed out:", message);
    },
  },
};
