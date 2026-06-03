import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

export const authConfig: NextAuthConfig = {
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

      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(
          new URL(auth?.user?.role === "admin" ? "/admin" : "/seller", nextUrl)
        );
      }

      if (pathname.startsWith("/admin") && auth?.user?.role !== "admin") {
        return Response.redirect(new URL("/seller", nextUrl));
      }

      if (pathname.startsWith("/seller") && auth?.user?.role !== "seller") {
        return Response.redirect(new URL("/admin", nextUrl));
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
