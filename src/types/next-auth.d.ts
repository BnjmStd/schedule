import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // UserRole enum value
      schoolId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    schoolId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    schoolId: string | null;
  }
}
