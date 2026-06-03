"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  LogOut,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/orders", label: "Orders", icon: <ClipboardList className="h-4 w-4" /> },
];

const sellerNav: NavItem[] = [
  { href: "/seller", label: "Catalog", icon: <ShoppingCart className="h-4 w-4" /> },
  { href: "/seller/orders", label: "My Orders", icon: <ClipboardList className="h-4 w-4" /> },
];

export function AppShell({
  children,
  role,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}) {
  const pathname = usePathname();
  const nav = role === "admin" ? adminNav : sellerNav;
  const title = role === "admin" ? "Admin Console" : "Seller Portal";

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-[var(--color-border)] bg-white hidden md:flex flex-col">
        <div className="p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-teal-800">
            <FlaskConical className="h-7 w-7" />
            <div>
              <p className="font-bold text-sm tracking-wide">AasaMedChem</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{title}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" &&
                item.href !== "/seller" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-teal-50 text-teal-900"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted-foreground)] mb-2 truncate">
            {userName}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-teal-800">
            <FlaskConical className="h-5 w-5" />
            AasaMedChem
          </div>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
