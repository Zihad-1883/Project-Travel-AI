import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-zinc-200/50 bg-zinc-50 dark:border-zinc-800/50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand block */}
          <div className="space-y-4 xl:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400">
                Travel AI
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-6 text-zinc-650 dark:text-zinc-400">
              Transforming your itineraries with context-aware AI recommendations. Discover your next adventure effortlessly.
            </p>
          </div>

          {/* Links structure */}
          <div className="mt-8 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                  Explore
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link href="/explore" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                      Travel Packages
                    </Link>
                  </li>
                  <li>
                    <Link href="/trip-planner" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                      AI Planner
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                  Company
                </h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link href="/about" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                      Travel Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-zinc-650 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Brand footer bar */}
        <div className="mt-12 border-t border-zinc-200/50 pt-8 dark:border-zinc-800/50 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {currentYear} Travel AI Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
