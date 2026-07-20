"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useBookings, useUpdateBookingStatus, Booking } from "@/hooks/useBookings";
import { useDeletePackage } from "@/hooks/usePackages";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Package {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  price: number;
  location: string;
  duration: string;
  images: string[];
  rating: number;
  ownerAdminId: string;
  createdAt: string;
}

interface PackagesListResponse {
  packages: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ManagePackagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const deletePackageMutation = useDeletePackage();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<"packages" | "bookings">("packages");

  // Modal and action states
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch admin bookings
  const { data: bookingsList = [], isLoading: isBookingsLoading, error: bookingsError } = useBookings();
  const updateBookingMutation = useUpdateBookingStatus();

  const handleUpdateBookingStatus = async (bookingId: string, status: "approved" | "rejected") => {
    try {
      await updateBookingMutation.mutateAsync({ id: bookingId, status });
      toast.success(`Booking status updated successfully to ${status}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update booking status.";
      toast.error(msg);
    }
  };

  // Fetch admin specific packages
  const { data, isLoading, error } = useQuery<PackagesListResponse, Error>({
    queryKey: ["admin-packages", user?.id],
    queryFn: () =>
      apiFetch<PackagesListResponse>("/api/packages", {
        params: {
          ownerAdminId: user?.id || "",
          limit: "100", // Retrieve all to manage
        },
      }),
    enabled: !!user?.id,
  });

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
      </div>
    );
  }

  const handleDelete = async (packageId: string) => {
    setDeletingId(packageId);
    try {
      await deletePackageMutation.mutateAsync(packageId);
      setDeleteTarget(null);
      toast.success("Package was successfully deleted.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete package.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const list = data?.packages || [];
  const averagePrice = list.length > 0 
    ? Math.round(list.reduce((acc, curr) => acc + curr.price, 0) / list.length) 
    : 0;

  // Location statistics for Packages
  const locationDataMap: Record<string, number> = {};
  list.forEach((pkg) => {
    const loc = pkg.location.split(",")[0] || "Other";
    locationDataMap[loc] = (locationDataMap[loc] || 0) + 1;
  });
  const packageLocationChartData = Object.entries(locationDataMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Status statistics for Bookings
  const statusDataMap: Record<string, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };
  bookingsList.forEach((b) => {
    if (statusDataMap[b.status] !== undefined) {
      statusDataMap[b.status]++;
    }
  });

  const bookingsChartData = [
    { name: "Pending", count: statusDataMap.pending, fill: "#f59e0b" },
    { name: "Approved", count: statusDataMap.approved, fill: "#10b981" },
    { name: "Rejected", count: statusDataMap.rejected, fill: "#ef4444" },
    { name: "Cancelled", count: statusDataMap.cancelled, fill: "#6b7280" },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Navigation Breadcrumb */}
        <nav className="mb-6 text-xs text-neutral-450 font-medium flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-neutral-400">&gt;</span>
          <span className="text-neutral-750">Manage Packages</span>
        </nav>

        {/* Header Block & Quick Metrics */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h1 className="font-fraunces text-3xl font-semibold text-neutral-900 mb-2">
              Admin Package Console
            </h1>
            <p className="font-sans text-neutral-700 text-sm">
              Overview and audit control panel for travel templates created under your administration.
            </p>
          </div>
          <div>
            <Link
              href="/items/add"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="text-lg">＋</span> Add New Package
            </Link>
          </div>
        </div>



        {/* Statistics Widgets Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
            <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">Your Published Items</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-neutral-900">{list.length}</span>
              <span className="text-xs text-neutral-400">active proposals</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
            <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">Average Pricing</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-secondary">${averagePrice}</span>
              <span className="text-xs text-neutral-400">per traveler</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between">
            <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">Audits & Verification</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-primary">100%</span>
              <span className="text-xs text-neutral-400">grounded schema</span>
            </div>
          </div>
        </section>

        {/* Visual Analytics Dashboard Row */}
        {mounted && (list.length > 0 || bookingsList.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Package Curation Chart */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between animate-fade-in">
              <div className="mb-4">
                <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">
                  Package Distribution
                </span>
                <h3 className="font-fraunces text-base font-semibold text-neutral-900 mt-1">
                  Active Templates by Region Location
                </h3>
              </div>
              <div className="h-64 w-full">
                {packageLocationChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={packageLocationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} 
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-medium">
                    No package geographic metrics recorded.
                  </div>
                )}
              </div>
            </div>

            {/* Bookings Status Chart */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm flex flex-col justify-between animate-fade-in">
              <div className="mb-4">
                <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block">
                  Booking Operations
                </span>
                <h3 className="font-fraunces text-base font-semibold text-neutral-900 mt-1">
                  Traveler Requested Bookings by Status
                </h3>
              </div>
              <div className="h-64 w-full">
                {bookingsList.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingsChartData.filter(d => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {bookingsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "rgba(255,255,255,0.95)", border: "1px solid #e5e7eb", borderRadius: "12px", fontSize: "12px" }} 
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center" 
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-neutral-400 font-medium">
                    No bookings requests metrics calculated yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Main Content Dashboard Container */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Tabs Navigation Header */}
          <div className="border-b border-neutral-200 px-6 pt-4 pb-0 flex items-center justify-between bg-neutral-50/50">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("packages")}
                className={`text-sm font-semibold pb-3 relative transition-colors cursor-pointer ${
                  activeTab === "packages"
                    ? "text-primary font-bold animate-fade-in"
                    : "text-neutral-450 hover:text-neutral-950 font-medium"
                }`}
              >
                My Packages
                {activeTab === "packages" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`text-sm font-semibold pb-3 relative transition-colors cursor-pointer ${
                  activeTab === "bookings"
                    ? "text-primary font-bold animate-fade-in"
                    : "text-neutral-450 hover:text-neutral-950 font-medium"
                }`}
              >
                Requested Bookings
                {activeTab === "bookings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            </div>
            <span className="text-xs text-neutral-400 font-mono pb-3">
              Count: {activeTab === "packages" ? list.length : bookingsList.length}
            </span>
          </div>

          {/* List/Table section */}
          {activeTab === "packages" ? (
            isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
                <span className="text-xs text-neutral-450">Loading operations queue...</span>
              </div>
            ) : error ? (
              <div className="p-16 text-center text-xs font-medium text-rose-500">
                Error fetching active templates catalog: {error.message}
              </div>
            ) : list.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-3xl mb-3">🏔️</div>
                <h3 className="font-semibold text-sm text-neutral-800 mb-1">No Proposals Found</h3>
                <p className="text-xs text-neutral-750 max-w-sm mx-auto mb-6">
                  You haven&apos;t published any expedition packages yet. Create a package template so travelers can customize their trip itineraries.
                </p>
                <Link
                  href="/items/add"
                  className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 font-semibold py-2 px-4 rounded-xl text-xs transition-all"
                >
                  ＋ Publish Your First Package
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {list.map((pkg) => (
                  <div key={pkg._id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hover:bg-neutral-50/20 transition-all font-sans">
                    
                    {/* Left block info */}
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-20 rounded-xl overflow-hidden bg-neutral-105 border border-neutral-200 shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pkg.images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80"}
                          alt={pkg.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {pkg.location}
                          </span>
                          <span className="text-xs text-neutral-450 bg-neutral-100 px-2 py-0.5 rounded font-mono">
                            ★ {pkg.rating.toFixed(1)}
                          </span>
                        </div>
                        <h4 className="font-fraunces text-base font-semibold text-neutral-900 leading-snug">
                          <Link href={`/packages/${pkg._id}`} className="hover:text-primary transition-colors">
                            {pkg.title}
                          </Link>
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                          {pkg.shortDescription || "No summary teaser description published."}
                        </p>
                      </div>
                    </div>

                    {/* Right specs and delete action triggers */}
                    <div className="flex items-center justify-between sm:justify-end gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-neutral-450 block uppercase tracking-wider">Duration / Price</span>
                        <span className="text-xs font-semibold text-neutral-900 block mt-0.5">{pkg.duration}</span>
                        <span className="text-sm font-bold text-secondary">${pkg.price}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/packages/${pkg._id}`}
                          className="px-3.5 py-1.5 border border-neutral-250 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(pkg)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all focus:outline-none"
                          aria-label="Delete Package"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )
          ) : (
            isBookingsLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
                <span className="text-xs text-neutral-450">Loading booking records...</span>
              </div>
            ) : bookingsError ? (
              <div className="p-16 text-center text-xs font-medium text-rose-500">
                Error fetching bookings: {bookingsError.message}
              </div>
            ) : bookingsList.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-sm text-neutral-800 mb-1">No Bookings Request</h3>
                <p className="text-xs text-neutral-750 max-w-sm mx-auto">
                  There are currently no package bookings submitted by travelers.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {bookingsList.map((booking: Booking) => {
                  const pkg = booking.packageDetails;
                  if (!pkg) return null;

                  return (
                    <div key={booking._id} className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 hover:bg-neutral-50/20 transition-all font-sans font-sans">
                      {/* Left: Package + Traveler Details */}
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-20 rounded-xl overflow-hidden bg-neutral-105 border border-neutral-200 shrink-0 relative">
                          <img
                            src={pkg.images[0] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80"}
                            alt={pkg.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {pkg.location}
                            </span>
                            <span className="text-xs text-neutral-400">
                              Booked by <span className="font-semibold text-neutral-750">{booking.userDetails?.name || "Unknown"}</span> ({booking.userDetails?.email || "No email"})
                            </span>
                          </div>
                          <h4 className="font-fraunces text-base font-semibold text-neutral-900 leading-snug">
                            <Link href={`/packages/${pkg._id}`} className="hover:text-primary transition-colors">
                              {pkg.title}
                            </Link>
                          </h4>
                          <p className="text-[11px] text-neutral-400 mt-1">
                            Submitted on {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Right: Booking price/status and action buttons */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] text-neutral-450 block uppercase tracking-wider">Price</span>
                          <span className="text-sm font-bold text-secondary">${pkg.price}</span>
                        </div>

                        {/* Status / Admin Actions */}
                        <div className="flex items-center gap-3 flex-row whitespace-nowrap">
                          {booking.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, "approved")}
                                disabled={updateBookingMutation.isPending}
                                className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, "rejected")}
                                disabled={updateBookingMutation.isPending}
                                className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                              booking.status === "approved"
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : booking.status === "cancelled"
                                ? "bg-neutral-100 border-neutral-250 text-neutral-500"
                                : "bg-secondary/10 border-secondary/20 text-secondary"
                            }`}>
                              {booking.status === "approved" ? "Approved" : booking.status === "cancelled" ? "Cancelled" : "Rejected"}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

        </div>

      </div>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity" onClick={() => setDeleteTarget(null)} />
          
          <div className="relative bg-white rounded-2xl max-w-md w-full border border-neutral-200 p-6 shadow-xl animate-scale-in">
            <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-2">
              Remove Expedition Package?
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed mb-6">
              You are about to delete <span className="font-semibold text-neutral-900">&ldquo;{deleteTarget.title}&rdquo;</span>. Once deleted, travelers will not be able to browse or customize this package proposal template. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3.5">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 border border-neutral-200 text-neutral-750 hover:bg-neutral-100 hover:text-neutral-950 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget._id)}
                disabled={deletingId !== null}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-6 rounded-xl text-xs transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              >
                {deletingId ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Understand & Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
