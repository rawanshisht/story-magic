"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, User, LogOut, LayoutDashboard, Sparkles, Store } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isPending, startTransition] = useTransition();

  if (loading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Main navigation">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold text-primary tracking-tight">Story Magic</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-24 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <nav role="navigation" aria-label="Main navigation" className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 md:h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 md:space-x-3 transition-transform hover:scale-105 min-w-0">
          <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
            <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold text-primary tracking-tight truncate">Story Magic</span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Link href="/bookstore" className="hidden md:block">
            <Button variant="ghost" size="lg" className="text-lg font-bold text-foreground">
              <Store className="mr-2 h-6 w-6 text-accent" />
              Bookstore
            </Button>
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:block">
                <Button variant="ghost" size="lg" className="text-lg font-bold text-foreground">
                  <LayoutDashboard className="mr-2 h-6 w-6 text-secondary" />
                  My Dashboard
                </Button>
              </Link>
              <Link href="/stories" className="hidden md:block">
                <Button variant="ghost" size="lg" className="text-lg font-bold text-foreground">
                  <BookOpen className="mr-2 h-6 w-6 text-primary" />
                  My Stories
                </Button>
              </Link>
              <Link href="/create">
                <Button variant="accent" size="sm" className="font-bold md:size-lg">
                  <Sparkles className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Create!</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 ring-primary/20 hover:ring-primary p-0"
                  >
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage
                        src={user.photoURL || ""}
                        alt={user.displayName || ""}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-lg">
                        {getInitials(user.displayName || user.email?.split("@")[0] || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl border-2 p-2" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.displayName && (
                        <p className="font-bold text-lg text-primary">{user.displayName}</p>
                      )}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/dashboard" className="w-full font-bold">
                      <LayoutDashboard className="mr-2 h-5 w-5 text-secondary" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/stories" className="w-full font-bold">
                  <BookOpen className="mr-2 h-5 w-5 text-primary" />
                  My Stories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                <Link href="/bookstore" className="w-full font-bold">
                  <Store className="mr-2 h-5 w-5 text-accent" />
                  Bookstore
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive rounded-xl font-bold focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/bookstore">
                <Button variant="ghost" size="lg" className="text-lg font-bold">
                  <Store className="mr-2 h-6 w-6 text-accent" />
                  Bookstore
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="text-lg font-bold">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="default" className="text-lg">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
