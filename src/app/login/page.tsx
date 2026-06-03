"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { homeForRole } from "@/lib/roles";
import { getUserRoleByEmail } from "@/lib/actions/users";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FlaskConical, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (!res?.ok) {
        setError("Sign in failed");
        setLoading(false);
        return;
      }

      // Fetch user's role directly from database to avoid client-side session races
      try {
        const role = await getUserRoleByEmail(email);
        router.push(homeForRole(role ?? "buyer"));
      } catch (roleError) {
        console.error("Error fetching role:", roleError);
        router.push("/buyer");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800">
            <FlaskConical className="h-6 w-6" />
          </div>

          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to AasaMedChem Inventory System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aasamedchem.demo"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>

              <Link href="/signup" className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </Link>
            </div>
          </form>

          {/* Signup Text */}
          <p className="mt-4 text-center text-sm text-slate-600">
            {"Don't have an account? "}
            <Link
              href="/signup"
              className="font-medium text-teal-700 hover:underline"
            >
              Sign Up
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-800">
              Demo Credentials
            </p>
            <p>Admin: admin@aasamedchem.demo / admin123</p>
            <p>Seller: seller@aasamedchem.demo / seller123</p>
            <p>Buyer: buyer@aasamedchem.demo / buyer123</p>
            <p className="text-slate-400">
              buyer2@aasamedchem.demo / buyer123
            </p>
          </div>

          {/* Back Home */}
          <p className="mt-4 text-center text-sm">
            <Link
              href="/"
              className="text-teal-700 hover:underline"
            >
              ← Back to Home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}