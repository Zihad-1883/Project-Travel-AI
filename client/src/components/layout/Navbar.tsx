"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
    { name: "Manage Bookings & Packages", href: "/items/manage" },
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

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMenu} className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
              Travel AI
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary dark:hover:text-primary-light ${
                  isActive
                    ? "text-primary dark:text-primary-light"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side Portal: Auth / Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-zinc-650 dark:text-zinc-400">
                Hello, <span className="font-semibold text-zinc-850 dark:text-zinc-200">{user.name || user.email}</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 border border-zinc-200/40 capitalize">
                  {user.role}
                </span>
              </span>
              <button
                onClick={logout}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 hover:text-primary dark:text-zinc-300 dark:hover:text-primary-light"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-500 hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white focus:outline-none cursor-pointer"
          >
            <svg
              className="h-6 w-6 transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Drawer (Framer Motion Animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/95 dark:bg-zinc-950/95 border-t border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-lg"
          >
            <div className="px-6 py-5.5 space-y-4">
              {/* Navigation links stack */}
              <div className="flex flex-col space-y-3.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={closeMenu}
                      className={`text-sm font-medium transition-colors py-1 ${
                        isActive
                          ? "text-primary dark:text-primary-light font-bold"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile actions stack */}
              <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-3">
                {user ? (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-650 dark:text-zinc-450 block">
                      Hello, <span className="font-semibold text-zinc-800 dark:text-zinc-205">{user.name || user.email}</span>
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="w-full inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Link
                      href="/login"
                      onClick={closeMenu}
                      className="w-full inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="w-full inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
