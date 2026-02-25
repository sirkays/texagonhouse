import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      isGenerated: boolean;
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      sessionToken?: string | null;
      role?: string | null;
    };
  }

  interface User {
    id: string;
  }
}
