import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      role = "buyer",
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        {
          status: 400,
        }
      );
    }

    const formattedEmail = String(email).toLowerCase().trim();

    if (role !== "buyer" && role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          error: "Invalid role specified",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await db.query.users.findFirst({
        where: eq(users.email, formattedEmail),
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        {
          status: 400,
        }
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email: formattedEmail,
      passwordHash,
      role: role as "buyer" | "seller" | "admin",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}