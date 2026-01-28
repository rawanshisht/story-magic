import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/landing/Footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const firebaseAuth = cookieStore.get("firebase-auth");

  if (!firebaseAuth) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navbar />
      <main className="container py-8 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
