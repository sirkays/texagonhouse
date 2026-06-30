// texagon_academy\texagonui\lib\auth.ts
import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type {JWT} from "next-auth/jwt";
import type {Session, User} from "next-auth";

//const BASE_URL = "http://127.0.0.1:9098"
const BASE_URL = process.env.BASE_URL;
const API_KEY =
  process.env.STORE_API_KEY || "WefMykHH.C4jZy9FYP3WbZdy7aBgP4L1Bg7vXChB8";

const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && {"X-Session-Token": sessionToken}),
});

export const authOptions: NextAuthOptions = {
  // lib/auth.ts
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email", placeholder: "Enter your email"},
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        // Support token-based auto-login
        const token = (credentials as any)?.token;
        if (credentials?.email && token) {
          try {
            // Step 2: Post-login check directly
            const url = new URL(`${BASE_URL}/accounts/api/post-login/`);
            const response = await fetch(url, {
              method: "GET",
              headers: headers(token),
            });

            const rawPostLogin = await response.text();
            let data;
            try {
              data = JSON.parse(rawPostLogin);
            } catch {
              throw new Error(
                `Invalid post-login response: ${rawPostLogin.slice(0, 100)}...`,
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
              name: data.username || credentials.email.split("@")[0],
              role: data.role,
              sessionToken: token,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              isGenerated: data.is_generated || false,
              hasAdminAccess: data.has_admin_access || false,
              hasNickname: data.has_nickname || false,
              nickname: data.nickname || null,
              username: data.username || null,
            };
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : "Token authentication failed";
            throw new Error(errorMessage);
          }
        }

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
              `Invalid login response: ${loginRaw.slice(0, 100)}...`,
            );
          }

          if (!loginResponse.ok) {
            const code = (loginData?.code || "").toString().toLowerCase();

            // map backend codes to stable frontend codes
            if (code === "past_due") throw new Error("past_due");
            if (code === "missing") throw new Error("subscription_missing");
            if (code === "expired" || code === "expired_by_date")
              throw new Error("subscription_expired");
            if (code === "cancelled") throw new Error("subscription_cancelled");
            if (code === "not_active") throw new Error("not_active");

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
              `Invalid post-login response: ${rawPostLogin.slice(0, 100)}...`,
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
            name: data.username || credentials.email.split("@")[0],
            role: data.role,
            sessionToken,
            expiresAt: loginData.expiresAt,
            isGenerated: data.is_generated || false,
            hasAdminAccess: data.has_admin_access || false,
            hasNickname: data.has_nickname || false,
            nickname: data.nickname || null,
            username: data.username || null,
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
    async jwt({token, user, trigger, session}: {token: JWT; user?: User; trigger?: "signIn" | "signUp" | "update"; session?: any}) {
      if (trigger === "update" && session) {
        if (session.nickname !== undefined) token.nickname = session.nickname;
        if (session.hasNickname !== undefined) token.hasNickname = session.hasNickname;
        if (session.name !== undefined) token.name = session.name;
        if (session.isGenerated !== undefined) token.isGenerated = session.isGenerated;
      }
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.sessionToken = (user as any).sessionToken;
        token.expiresAt = (user as any).expiresAt;
        token.isGenerated = (user as any).isGenerated;
        token.hasAdminAccess = (user as any).hasAdminAccess;
        token.hasNickname = (user as any).hasNickname;
        token.nickname = (user as any).nickname;
        token.username = (user as any).username;
      }
      if (token.expiresAt && new Date(token.expiresAt as string) < new Date()) {
        return {} as JWT; // Return empty JWT instead of null
      }
      return token;
    },

    async session({session, token}: {session: Session; token: JWT}) {
      if (!token || !token.sessionToken) {
        return {...session, user: undefined, expires: new Date().toISOString()};
      }
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).sessionToken = token.sessionToken;
        (session.user as any).expiresAt = token.expiresAt;
        (session.user as any).isGenerated = token.isGenerated;
        (session.user as any).hasAdminAccess = token.hasAdminAccess;
        (session.user as any).hasNickname = token.hasNickname;
        (session.user as any).nickname = token.nickname;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },

  secret: process.env.SECRET_KEY,

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
