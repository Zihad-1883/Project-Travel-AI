"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
  ];

  const travelerLinks = [
    { name: "AI Planner", href: "/trip-planner" },
    { name: "My Bookings", href: "/my-bookings" },
  ];

  const adminLinks = [
    { name: "Add Package", href: "/items/add" },
    { name: "Manage Packages", href: "/items/manage" },
  ];

  const footerCompanyLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
  ];

  let navLinks = [...publicLinks];
  if (user) {
    if (user.role === "admin") {
      navLinks = [...navLinks, ...adminLinks];
    } else {
      navLinks = [...navLinks, ...travelerLinks];
    }
  }
  navLinks = [...navLinks, ...footerCompanyLinks];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
              Travel AI
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-650 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-650 dark:text-zinc-400 hidden sm:inline">
                Hello, <span className="font-semibold text-zinc-850 dark:text-zinc-200">{user.name || user.email}</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40 capitalize">
                  {user.role}
                </span>
              </span>
              <button
                onClick={logout}
                className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
