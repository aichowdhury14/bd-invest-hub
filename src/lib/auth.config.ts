import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no Prisma/bcrypt) so it can be imported by middleware directly.
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
};
