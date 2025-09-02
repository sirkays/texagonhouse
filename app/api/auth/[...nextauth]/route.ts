import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_URL = "https://texagonbackend.epichouse.online";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

const headers = (sessionToken?: string) => ({
  Authorization: `Api-Key ${API_KEY}`,
  "Content-Type": "application/json",
  ...(sessionToken && { "X-Session-Token": sessionToken }),
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter your email" },
        password: { label: "Password", type: "password", placeholder: "Enter your password" },
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
            throw new Error(`Invalid login response: ${loginRaw.slice(0, 100)}...`);
          }

          if (!loginResponse.ok) {
            throw new Error(loginData.detail || `Login failed (${loginResponse.status})`);
          }

          const sessionToken = loginData.sessionToken;
          if (!sessionToken) {
            throw new Error("No session token returned by login API");
          }

          // Step 2: Post-login check
          const url = new URL(`${BASE_URL}/accounts/api/post-login/`);
          url.searchParams.append("email", credentials.email);
          url.searchParams.append("password", credentials.password);

          const response = await fetch(url, {
            method: "GET",
            headers: headers(sessionToken),
          });

          const rawPostLogin = await response.text();
          let data;
          try {
            data = JSON.parse(rawPostLogin);
          } catch {
            throw new Error(`Invalid post-login response: ${rawPostLogin.slice(0, 100)}...`);
          }

          if (!response.ok || data.detail !== "User access granted" || !data.role) {
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
          const errorMessage = err instanceof Error ? err.message : "Authentication failed";
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionToken = user.sessionToken;
        token.expiresAt = user.expiresAt;
      }
      // Check if token is expired
      if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
        console.log("[Auth] Token expired, invalidating:", token.sessionToken);
        return null; // Invalidate the token
      }
      return token;
    },

    async session({ session, token }) {
      if (!token) {
        console.log("[Auth] No valid token, session invalidated");
        return { ...session, user: null, expires: new Date().toISOString() };
      }
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionToken = token.sessionToken;
        session.user.expiresAt = token.expiresAt;
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
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  events: {
    async signOut(message) {
      console.log("[Auth] User signed out:", message);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };