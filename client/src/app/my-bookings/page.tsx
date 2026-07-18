"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBookings, Booking } from "@/hooks/useBookings";

export default function MyBookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/my-bookings");
    }
  }, [user, loading, router]);

  // Fetch traveler bookings
  const { data: bookings = [], isLoading, error } = useBookings();

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Action
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 text-xs text-neutral-400 font-medium flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-neutral-400">&gt;</span>
          <span className="text-neutral-700">My Bookings</span>
        </nav>

        {/* Header Block */}
        <div className="mb-10">
          <h1 className="font-fraunces text-3xl font-semibold text-neutral-900 mb-2">
            My Expedition Bookings
          </h1>
          <p className="font-sans text-neutral-700 text-sm">
            Keep track of your customized itinerary bookings and template purchase statuses.
          </p>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
            <span className="text-xs text-neutral-400">Loading your reservations...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center text-xs font-medium text-rose-500 shadow-sm">
            Error fetching booking records: {error.message}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center shadow-sm">
            <div className="text-4xl mb-4">✈️</div>
            <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-2">
              No Bookings Yet
            </h3>
            <p className="text-xs text-neutral-700 max-w-sm mx-auto mb-6">
              You haven&apos;t booked any curated packages. Head over to our catalog to select your next dream expedition.
            </p>
            <Link
              href="/explore"
              className="inline-flex bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const pkg = booking.packageDetails;
              if (!pkg) return null;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow shadow-sm font-sans"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-24 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                      <img
                        src={pkg.images?.[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80"}
                        alt={pkg.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {pkg.location}
                        </span>
                        <span className="text-[10px] text-neutral-450">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-fraunces text-lg font-semibold text-neutral-900 leading-snug">
                        <Link href={`/packages/${pkg._id}`} className="hover:text-primary transition-colors">
                          {pkg.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
                        <span>⏱️ {pkg.duration}</span>
                        <span>🏷️ ${pkg.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-4 min-w-[150px] justify-between sm:justify-end">
                      <span className="text-xs text-neutral-400 md:hidden">Request Status:</span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <Link
                      href={`/packages/${pkg._id}`}
                      className="px-4 py-2 border border-neutral-200 hover:border-neutral-350 text-neutral-700 hover:text-neutral-900 rounded-xl text-xs font-semibold text-center mt-2 sm:mt-0 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
