import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_URL = "https://texagonbackend.esm.name.ng";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";

const headers = (sessionToken) => ({
  "Authorization": `Api-Key ${API_KEY}`,
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
          console.error("[Auth] Missing email or password");
          throw new Error("Email and password are required");
        }

        try {
          // Step 1: Authenticate with /api/auth/login
          const loginResponse = await fetch(`${BASE_URL}/api/auth/login/`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log("[Auth] Login API response status:", loginResponse.status);
          console.log("[Auth] Login API response headers:", Object.fromEntries(loginResponse.headers));

          const loginRawResponse = await loginResponse.text();
          console.log("[Auth] Raw response from login API:", loginRawResponse);

          let loginData;
          try {
            loginData = JSON.parse(loginRawResponse);
          } catch (parseError) {
            console.error("[Auth] Failed to parse login JSON:", parseError);
            throw new Error(`Invalid login response format: ${loginRawResponse.slice(0, 100)}...`);
          }

          if (!loginResponse.ok) {
            console.error("[Auth] Login failed:", loginResponse.status, loginData);
            throw new Error(loginData.detail || `HTTP error: ${loginResponse.status}`);
          }

          const sessionToken = loginData.sessionToken;
          if (!sessionToken) {
            console.error("[Auth] No session token in login response");
            throw new Error("No session token provided by login API");
          }

          // Step 2: Use session token for /accounts/api/post-login/
          const url = new URL(`${BASE_URL}/accounts/api/post-login/`);
          url.searchParams.append("email", credentials.email);
          url.searchParams.append("password", credentials.password);

          const response = await fetch(url, {
            method: "GET",
            headers: headers(sessionToken),
          });

          console.log("[Auth] Post-login API response status:", response.status);
          console.log("[Auth] Post-login API response headers:", Object.fromEntries(response.headers));

          const rawResponse = await response.text();
          console.log("[Auth] Raw response from post-login API:", rawResponse);

          let data;
          try {
            data = JSON.parse(rawResponse);
          } catch (parseError) {
            console.error("[Auth] Failed to parse post-login JSON:", parseError);
            throw new Error(`Invalid post-login response format: ${rawResponse.slice(0, 100)}...`);
          }

          if (!response.ok) {
            console.error("[Auth] Post-login failed:", response.status, data);
            throw new Error(data.detail || `HTTP error: ${response.status}`);
          }

          if (data.detail === "User access granted" && data.role) {
            const user = {
              id: data.org_membership_pk || credentials.email,
              email: credentials.email,
              name: credentials.email.split("@")[0],
              role: data.role,
              sessionToken,
              expiresAt: loginData.expiresAt,
            };
            console.log("[Auth] User authorized:", user);
            return user;
          }

          console.error("[Auth] Invalid post-login response: User access not granted or role missing");
          throw new Error("Invalid post-login response: User access not granted or role missing");
        } catch (error) {
          console.error("[Auth] Authorize error:", error);
          const errorMessage = typeof error === "object" && error !== null && "message" in error ? error.message : undefined;
          throw new Error(errorMessage || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("[Auth] JWT callback:", { token, user });
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionToken = user.sessionToken;
        token.expiresAt = user.expiresAt;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth] Session callback:", { session, token });
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionToken = token.sessionToken;
        session.user.expiresAt = token.expiresAt;
      }
      return session;
    },
    async signOut({ token }) {
      console.log("[Auth] SignOut callback triggered, token:", { sessionToken: token.sessionToken });
      return true; // Handled by /api/auth/logout
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-here",
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };