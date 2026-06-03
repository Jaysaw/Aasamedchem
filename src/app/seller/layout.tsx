import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "seller") redirect("/login");

  return (
    <AppShell role="seller" userName={session.user.name ?? session.user.email!}>
      {children}
    </AppShell>
  );
}
