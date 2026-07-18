"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePackages, Package } from "@/hooks/usePackages";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load initial search queries from params
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  // State Management
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [page, setPage] = useState<number>(1);
  const limit = 6;

  // Track previous search params to sync/update state when they change externally (e.g. navigation)
  const [prevSearch, setPrevSearch] = useState(initialSearch);
  const [prevLocation, setPrevLocation] = useState(initialLocation);

  if (initialSearch !== prevSearch || initialLocation !== prevLocation) {
    setPrevSearch(initialSearch);
    setPrevLocation(initialLocation);
    setSearch(initialSearch);
    setLocation(initialLocation);
    setPage(1);
  }

  // Query database using custom TanStack hook
  const { data, isLoading, error } = usePackages({
    search: search.trim() || undefined,
    location: location || undefined,
    maxPrice: maxPrice || undefined,
    minRating: minRating || undefined,
    sortBy: sortBy || undefined,
    page,
    limit,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setMinRating("");
    setSortBy("newest");
    setPage(1);
    router.push("/explore");
  };

  const packagesList = data?.data?.packages || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit: 6, totalPages: 1 };

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Page Title Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="font-fraunces text-4xl font-semibold text-neutral-900 mb-2">
            Explore Expeditions
          </h1>
          <p className="font-sans text-neutral-700 text-sm">
            Find the perfect collection matching your tastes, curated by our expert AI filters.
          </p>
        </div>

        {/* Filter Controls Widget */}
        <div className="bg-neutral-100 rounded-xl border border-neutral-200 p-6 mb-10 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

            {/* Search Input field */}
            <div className="flex flex-col">
              <label htmlFor="search-input" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Search Term
              </label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. shrine, tour, ski..."
                className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-neutral-900 text-ellipsis focus:border-primary"
              />
            </div>

            {/* Location selector */}
            <div className="flex flex-col">
              <label htmlFor="location-select" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Location
              </label>
              <select
                id="location-select"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-neutral-900 focus:border-primary"
              >
                <option value="">All Destinations</option>
                <option value="Bali">Bali, Indonesia</option>
                <option value="Zermatt">Zermatt, Switzerland</option>
                <option value="Kyoto">Kyoto, Japan</option>
                <option value="Serengeti">Serengeti, Tanzania</option>
                <option value="Amalfi">Amalfi Coast, Italy</option>
              </select>
            </div>

            {/* Max Budget filter */}
            <div className="flex flex-col">
              <label htmlFor="max-price-slider" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2 flex justify-between">
                <span>Max Budget</span>
                <span className="text-secondary font-bold">{maxPrice ? `$${maxPrice}` : "Any"}</span>
              </label>
              <input
                id="max-price-slider"
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice || "5000"}
                onChange={(e) => {
                  setMaxPrice(e.target.value === "5000" ? "" : e.target.value);
                  setPage(1);
                }}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary mt-3"
              />
            </div>

            {/* Minimum Rating */}
            <div className="flex flex-col">
              <label htmlFor="rating-select" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Min Rating
              </label>
              <select
                id="rating-select"
                value={minRating}
                onChange={(e) => {
                  setMinRating(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white border border-neutral-250 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-neutral-900 focus:border-primary"
              >
                <option value="">Any Rating</option>
                <option value="4">4.0 ★ & Above</option>
                <option value="4.5">4.5 ★ & Above</option>
                <option value="4.8">4.8 ★ & Above</option>
              </select>
            </div>

          </div>

          {/* Sort selection & Reset controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-neutral-200 gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="sort-select" className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Sort By:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-neutral-250 rounded-xl px-3 py-1.5 text-xs focus:outline-none text-neutral-900 focus:border-primary"
              >
                <option value="newest">Newly Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <button
              onClick={handleClearFilters}
              className="text-neutral-700 hover:text-secondary text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        {/* LOADING STATE - SKELETON LOADERS */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden h-96 flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="h-48 bg-neutral-200 rounded-lg w-full" />
                  <div className="h-4 bg-neutral-200 rounded w-1/3" />
                  <div className="h-6 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-5/6" />
                </div>
                <div className="h-8 bg-neutral-200 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="text-center py-20 bg-neutral-100 rounded-xl border border-neutral-200">
            <span className="text-secondary text-lg font-bold block mb-2">Error Connection Failed</span>
            <p className="text-neutral-700 text-sm max-w-md mx-auto mb-6">{error.message}</p>
            <button
              onClick={handleClearFilters}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 text-sm rounded-xl"
            >
              Reset Search Configuration
            </button>
          </div>
        )}

        {/* COMPLETED PACKAGES LIST DATA */}
        {!isLoading && !error && (
          <>
            {packagesList.length === 0 ? (
              <div className="text-center py-20 bg-neutral-100 rounded-xl border border-neutral-200">
                <svg className="h-12 w-12 text-neutral-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-2">
                  No Expeditions Found
                </h3>
                <p className="text-neutral-700 text-sm max-w-xs mx-auto mb-6">
                  No packages matched your active filters. Try clearing your search parameters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 text-sm rounded-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {packagesList.map((pkg: Package) => (
                  <article
                    key={pkg._id}
                    className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    <div className="h-56 overflow-hidden relative">
                      <img
                        src={pkg.images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80"}
                        alt={pkg.title}
                        className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-neutral-900/80 text-xs text-white px-2 py-1 rounded-lg flex items-center gap-1 font-semibold">
                        <span className="text-accent">★</span>
                        <span>{pkg.rating}</span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                        <span>{pkg.location}</span>
                        <span>{pkg.duration}</span>
                      </div>

                      <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-3 leading-snug">
                        {pkg.title}
                      </h3>

                      <p className="text-xs text-neutral-700 leading-relaxed mb-6 flex-grow line-clamp-3">
                        {pkg.description}
                      </p>

                      <div className="flex items-end justify-between pt-4 border-t border-neutral-200 mt-auto">
                        <div className="flex items-center gap-1 font-sans text-xs text-neutral-700">
                          {pkg.maxGroupSize && (
                            <>
                              <span>👤 Max:</span>
                              <span className="font-semibold">{pkg.maxGroupSize} guests</span>
                            </>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-neutral-400 block">Baseline Rate</span>
                          <span className="text-secondary font-bold text-lg">${pkg.price}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-1">
                        <Link
                          href={`/packages/${pkg._id}`}
                          className="w-full block text-center bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 text-xs rounded-xl transition-colors"
                        >
                          View Details
                        </Link>
                      </div>

                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination UI Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t border-neutral-200">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-250 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs font-medium text-neutral-700">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-250 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-primary" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
