"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Modal and action states
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

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
    setActionError(null);

    try {
      await apiFetch(`/api/packages/${packageId}`, {
        method: "DELETE",
      });

      // Refreeh list by invalidating cache queries
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      
      setDeleteTarget(null);
      setShowNotification("Package was successfully deleted.");
      setTimeout(() => {
        setShowNotification(null);
      }, 3000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to delete package.");
    } finally {
      setDeletingId(null);
    }
  };

  const list = data?.packages || [];
  const averagePrice = list.length > 0 
    ? Math.round(list.reduce((acc, curr) => acc + curr.price, 0) / list.length) 
    : 0;

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

        {/* Global Notifications Alert Banner */}
        {showNotification && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-sm">
            <span>✓</span>
            <span>{showNotification}</span>
          </div>
        )}

        {/* Error Notice */}
        {actionError && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
        )}

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

        {/* Main Content Dashboard Container */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Tabs Navigation Header */}
          <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between bg-neutral-50/50">
            <div className="flex gap-6 border-b border-transparent">
              <button className="text-sm font-semibold text-primary pb-1 border-b-2 border-primary -mb-[18px]">
                My Packages
              </button>
            </div>
            <span className="text-xs text-neutral-400 font-mono">Count: {list.length}</span>
          </div>

          {/* List/Table section */}
          {isLoading ? (
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
