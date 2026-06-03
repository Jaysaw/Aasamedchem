import type { UserRole } from "@/types";

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  seller: "/seller",
  buyer: "/buyer",
};

export function homeForRole(role: UserRole): string {
  return ROLE_HOME[role] ?? "/login";
}
