import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";
import { homeForRole } from "@/lib/roles";

function roleGuard(pathname: string, role: UserRole | undefined): string | null {
  if (pathname.startsWith("/admin") && role !== "admin") {
    return homeForRole(role ?? "buyer");
  }
  if (pathname.startsWith("/seller") && role !== "seller") {
    return homeForRole(role ?? "buyer");
  }
  if (pathname.startsWith("/buyer") && role !== "buyer") {
    return homeForRole(role ?? "buyer");
  }
  return null;
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const publicPaths = ["/", "/login"];
      const isPublic = publicPaths.includes(pathname);

      if (!isLoggedIn && !isPublic) return false;

      const role = auth?.user?.role as UserRole | undefined;

      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL(homeForRole(role!), nextUrl));
      }

      const redirect = roleGuard(pathname, role);
      if (redirect) {
        return Response.redirect(new URL(redirect, nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
