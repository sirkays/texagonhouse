import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BASE_URL = "https://texagonbackend.esm.name.ng";
const API_KEY = "GenYD7kB.PNsqar8GzuhbHjhDT7DesVvbUPeMD7Vl";
const SESSION_TOKEN = "m6wNWkxq8KIECxr8kFsCFlk_I_0LXuSDGFH1uYXhIqZ3Qnm1jRbZIF_WuC3DPn8E";

const headers = () => ({
  "Authorization": `Api-Key ${API_KEY}`,
  "X-Session-Token": SESSION_TOKEN,
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
          const url = new URL(`${BASE_URL}/accounts/api/post-login/`);
          url.searchParams.append("email", credentials.email);
          url.searchParams.append("password", credentials.password);

          const response = await fetch(url, {
            method: "GET",
            headers: headers(),
          });

          // Log response details for debugging
          console.log("Login API response status:", response.status);
          console.log("Login API response headers:", Object.fromEntries(response.headers));

          // Get raw response text
          const rawResponse = await response.text();
          console.log("Raw response from login API:", rawResponse);

          // Attempt to parse JSON
          let data;
          try {
            data = JSON.parse(rawResponse);
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            throw new Error(`Invalid response format: ${rawResponse.slice(0, 100)}...`);
          }

          if (!response.ok) {
            console.error("Login failed:", response.status, data);
            throw new Error(data.message || `HTTP error: ${response.status}`);
          }

          // Extract role and other data from API response
          if (data.detail === "User access granted" && data.role) {
            return {
              id: data.org_membership_pk || credentials.email, // Use org_membership_pk as id
              email: credentials.email,
              name: credentials.email.split("@")[0], // Fallback name from email
              role: data.role, // e.g., "admin", "student"
            };
          }

          throw new Error("Invalid response: User access not granted or role missing");
        } catch (error) {
          console.error("Authorize error:", error);
          const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : undefined;
          throw new Error(errorMessage || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        if (token.id) (session.user as any).id = token.id;
        if (token.role) (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: "your-secret-here", // Hardcoded as requested; use a secure secret in production
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };