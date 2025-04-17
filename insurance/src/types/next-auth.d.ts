// This file extends NextAuth types to include custom properties
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

// Add the Auth interface for middleware
declare module "next/server" {
  interface NextRequestContext {
    auth: {
      user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
      };
      token?: JWT;
    } | null;
  }
}
