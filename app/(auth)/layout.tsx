import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FooterSimple } from "@/components/shared/FooterSimple";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center space-x-2"
      >
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">Story Magic</span>
      </Link>
      <main className="w-full max-w-md px-4">{children}</main>
      <FooterSimple />
    </div>
  );
}
