"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePackageDetails, usePackages, Package } from "@/hooks/usePackages";
import { useAuth } from "@/context/AuthContext";
import { useCreateBooking, useBookings } from "@/hooks/useBookings";
import { useLogInteraction } from "@/hooks/useRecommendations";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const logInteractionMutation = useLogInteraction();

  // Log implicit view interaction when traveler opens page
  useEffect(() => {
    if (user && id && user.role === "traveler") {
      logInteractionMutation.mutate({ packageId: id, type: "view" });
    }
  }, [user, id, logInteractionMutation]);

  // Fetch package details
  const { data: detailData, isLoading: isDetailLoading, error: detailError } = usePackageDetails(id);
  const pkg = detailData;

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Booking state
  const createBookingMutation = useCreateBooking();
  const { data: bookings = [] } = useBookings();
  const hasBooked = !!user && bookings.some(
    (b) => b.packageId === id && (b.status === "pending" || b.status === "approved")
  );
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleBookNow = () => {
    if (!user) {
      router.push(`/login?redirect=/packages/${id}`);
      return;
    }
    setShowBookingConfirm(true);
  };

  const confirmBooking = async () => {
    try {
      await createBookingMutation.mutateAsync({ packageId: id });
      setBookingMessage({ type: "success", text: "Expedition booked successfully! Your request status is pending." });
      setShowBookingConfirm(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create booking request.";
      setBookingMessage({ type: "error", text: errorMsg });
      setShowBookingConfirm(false);
    }
  };

  // Fetch general packages for related suggestions
  const { data: listData, isLoading: isListLoading } = usePackages({ limit: 4 });
  const relatedPackages = (listData?.packages || []).filter((p) => p._id !== id).slice(0, 3);

  // Loading Skeleton
  if (isDetailLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse space-y-8">
          <div className="h-96 bg-neutral-200 rounded-xl w-full" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3" />
            <div className="h-6 bg-neutral-200 rounded w-1/4" />
            <div className="h-6 bg-neutral-200 rounded w-1/5" />
          </div>
          <div className="h-32 bg-neutral-200 rounded-xl w-full" />
          <div className="h-48 bg-neutral-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  // Error boundary
  if (detailError || !pkg) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16 px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center py-12 px-8 bg-neutral-100 border border-neutral-200 rounded-xl max-w-md">
          <span className="text-secondary text-lg font-bold block mb-2">Failed to Load Package</span>
          <p className="text-neutral-700 text-sm mb-6">
            The package may have been removed or the connection timed out.
          </p>
          <Link
            href="/explore"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 text-sm rounded-xl"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = pkg.images.length > 0 ? pkg.images : [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Breadcrumbs */}
        <nav className="mb-6 text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link href="/explore" className="hover:text-primary">Explore</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-neutral-700">{pkg.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
          
          {/* Interactive Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-96 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
              <img
                src={galleryImages[activeImageIndex]}
                alt={`${pkg.title} display`}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 right-4 bg-neutral-900/85 text-xs text-white px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 shadow-sm">
                <span className="text-accent">★</span>
                <span>{pkg.rating}</span>
              </div>
            </div>

            {/* Thumbnail Controls */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border-2 transition-all ${
                      activeImageIndex === idx ? "border-primary scale-[1.03]" : "border-transparent opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt="Thumbnail view"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specifications Info Panel */}
          <div className="bg-neutral-100 rounded-xl border border-neutral-200 p-8 space-y-6 shadow-sm">
            <div>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                {pkg.location}
              </span>
              <h1 className="font-fraunces text-3xl font-semibold text-neutral-900 leading-tight">
                {pkg.title}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-6 py-4 border-y border-neutral-200 text-sm">
              <div>
                <span className="text-neutral-400 block mb-1">Duration</span>
                <span className="font-semibold text-neutral-900">{pkg.duration}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Group Size</span>
                <span className="font-semibold text-neutral-900">
                  {pkg.maxGroupSize ? `Max ${pkg.maxGroupSize} guests` : "Custom"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block">Baseline Pricing</span>
                <span className="text-secondary font-bold text-3xl">${pkg.price}</span>
                <span className="text-xs text-neutral-400 block mt-1">per traveler</span>
              </div>

              <div className="text-right text-xs text-neutral-400">
                <span className="text-accent text-sm font-semibold">★ {pkg.rating}</span>
                <span className="block mt-1">Verified Ratings</span>
              </div>
            </div>

            {/* Custom CTA Action */}
            <div className="pt-4 space-y-3">
              {bookingMessage && (
                <div
                  className={`p-3 border rounded-xl text-xs font-semibold ${
                    bookingMessage.type === "success"
                      ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                      : "bg-rose-50 border-rose-250 text-rose-800"
                  }`}
                >
                  {bookingMessage.text}
                </div>
              )}

              {user?.role !== "admin" && (
                <button
                  onClick={handleBookNow}
                  disabled={createBookingMutation.isPending || hasBooked}
                  className="w-full text-center block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 text-sm rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBookingMutation.isPending
                    ? "Booking..."
                    : hasBooked
                    ? "Already Booked"
                    : "Book Now"}
                </button>
              )}

              <Link
                href={`/trip-planner?packageId=${pkg._id}`}
                className="w-full text-center block bg-secondary hover:bg-secondary-dark text-white font-semibold py-3 px-6 text-sm rounded-xl shadow-md transition-colors"
              >
                Customize Itinerary with AI
              </Link>
              <p className="text-[11px] text-neutral-750 text-center">
                Create a customized, AI-optimized request based on this collection.
              </p>
            </div>

          </div>
        </div>

        {/* Detailed Overview */}
        <section className="mb-16 border-t border-neutral-200 pt-10">
          <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 mb-4">
            Expedition Overview
          </h2>
          <p className="text-sm text-neutral-750 leading-relaxed font-sans mb-6">
            {pkg.description}
          </p>

          <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">What&apos;s Included</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-750">
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold text-sm">✓</span>
                Premium handpicked boutique hotel accommodations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold text-sm">✓</span>
                All private ground airport transfers and local shuttles
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold text-sm">✓</span>
                Curated daily exploration tours with local guides
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary font-bold text-sm">✓</span>
                In-country support during active itinerary phases
              </li>
            </ul>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="mb-16 border-t border-neutral-200 pt-10">
          <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 mb-6">
            Verified Reviews
          </h2>
          
          <div className="space-y-6">
            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">Eleanor Sterling</h4>
                  <span className="text-xs text-neutral-400">June 2026</span>
                </div>
                <span className="text-accent text-xs font-semibold bg-neutral-200/50 px-2 py-0.5 rounded">
                  ★ 5.0
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                We had a magnificent experience. Our custom suggestions matched exactly what we discussed. The logistics flowed smoothly from hotel check-in to transport.
              </p>
            </div>

            <div className="bg-neutral-100 rounded-xl p-6 border border-neutral-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">Devon Hales</h4>
                  <span className="text-xs text-neutral-400">May 2026</span>
                </div>
                <span className="text-accent text-xs font-semibold bg-neutral-200/50 px-2 py-0.5 rounded">
                  ★ 4.8
                </span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Stunning locations and incredibly organized. We made adjustments in our custom planner widget which were prompt and quoted correctly by the admin. Highly recommended.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Cross-Selling Feed */}
        {relatedPackages.length > 0 && (
          <section className="border-t border-neutral-200 pt-10">
            <h2 className="font-fraunces text-2xl font-semibold text-neutral-900 mb-6">
              Similar Expeditions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPackages.map((rel: Package) => (
                <div
                  key={rel._id}
                  className="bg-neutral-100 border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={rel.images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80"}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-neutral-400 text-xs block mb-1">{rel.location}</span>
                    <h3 className="font-fraunces text-base font-semibold text-neutral-900 mb-2 leading-tight line-clamp-1">
                      {rel.title}
                    </h3>
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-neutral-200">
                      <span className="text-[11px] text-neutral-400">{rel.duration}</span>
                      <span className="text-secondary font-bold text-sm">${rel.price}</span>
                    </div>
                    <Link
                      href={`/packages/${rel._id}`}
                      className="mt-3 block text-center bg-primary hover:bg-primary-dark text-white font-semibold py-1.5 text-[11px] rounded-lg transition-colors"
                    >
                      View Package
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Booking Confirmation Modal */}
      {showBookingConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity" onClick={() => setShowBookingConfirm(false)} />
          
          <div className="relative bg-white rounded-2xl max-w-md w-full border border-neutral-200 p-6 shadow-xl animate-scale-in">
            <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-2">
              Confirm Booking
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed mb-6 font-sans">
              Are you sure you want to book <span className="font-semibold text-neutral-900">&ldquo;{pkg.title}&rdquo;</span> for <span className="font-bold text-secondary">${pkg.price}</span>? Your booking status will be pending approval.
            </p>

            <div className="flex items-center justify-end gap-3.5">
              <button
                onClick={() => setShowBookingConfirm(false)}
                className="px-4 py-2 border border-neutral-200 text-neutral-750 hover:bg-neutral-100 hover:text-neutral-950 rounded-xl text-xs font-semibold transition-colors font-sans"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-xl text-xs transition-all font-sans"
              >
                Confirm & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
