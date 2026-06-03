"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/types";

export async function getUserRoleByEmail(email: string): Promise<UserRole | null> {
  try {
    const formattedEmail = String(email).toLowerCase().trim();
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, formattedEmail))
      .limit(1);

    return (user?.role as UserRole) ?? null;
  } catch (error) {
    console.error("Error in getUserRoleByEmail:", error);
    return null;
  }
}
