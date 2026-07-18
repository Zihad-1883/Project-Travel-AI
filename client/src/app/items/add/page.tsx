"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

export default function AddPackagePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Loading and authorization guard
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Form State
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Bali, Indonesia");
  const [customLocation, setCustomLocation] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [rating, setRating] = useState("5.0");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  
  // Image links state (up to 3 images)
  const [imgUrl1, setImgUrl1] = useState("");
  const [imgUrl2, setImgUrl2] = useState("");
  const [imgUrl3, setImgUrl3] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-250 border-t-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Validate custom location if selected
    const finalLocation = location === "Custom" ? customLocation.trim() : location;
    if (!finalLocation) {
      setFormError("Please enter a custom location name.");
      setFormLoading(false);
      return;
    }

    // Compile active image URLs
    const images: string[] = [];
    if (imgUrl1.trim()) images.push(imgUrl1.trim());
    if (imgUrl2.trim()) images.push(imgUrl2.trim());
    if (imgUrl3.trim()) images.push(imgUrl3.trim());

    try {
      await apiFetch("/api/packages", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription.trim(),
          price: Number(price),
          duration: duration.trim() || undefined,
          location: finalLocation,
          images,
          rating: Number(rating) || 5.0,
        }),
      });

      setFormSuccess(true);
      setTimeout(() => {
        router.push("/items/manage");
      }, 1500);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create package.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-12 px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">&gt;</span>
          <Link href="/items/manage" className="hover:text-primary transition-colors">Manage Packages</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-neutral-750">Add Package</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="font-fraunces text-3xl font-semibold text-neutral-900 mb-2">
            Create Custom Expedition
          </h1>
          <p className="font-sans text-neutral-700 text-sm">
            Publish a new curated destination proposal package for travelers to locate, customize, and finalize booking requests.
          </p>
        </div>

        {/* Success Banner */}
        {formSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-fade-in">
            <span className="text-xl">✓</span>
            <div className="text-sm font-medium">
              Expedition package published successfully! Redirecting to dashboard...
            </div>
          </div>
        )}

        {/* Form Card Layout */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-8">
          
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
              <span className="text-base">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Standard Specs */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">
              1. Core Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                  Expedition Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Majestic Alpine Escape"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all text-neutral-900"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                  Baseline Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 1500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Location Selector */}
              <div className="flex flex-col col-span-1 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                  Destination Region *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-neutral-100 border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none text-neutral-900"
                  >
                    <option value="Bali, Indonesia">Bali, Indonesia</option>
                    <option value="Zermatt, Switzerland">Zermatt, Switzerland</option>
                    <option value="Kyoto, Japan">Kyoto, Japan</option>
                    <option value="Serengeti, Tanzania">Serengeti, Tanzania</option>
                    <option value="Amalfi Coast, Italy">Amalfi Coast, Italy</option>
                    <option value="Cairo, Egypt">Cairo, Egypt</option>
                    <option value="Custom">-- Custom Location --</option>
                  </select>

                  {location === "Custom" && (
                    <input
                      type="text"
                      required
                      placeholder="Enter city, country"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all text-neutral-900"
                    />
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                  Duration *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Days / 4 Nights"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Rating */}
              <div className="flex flex-col sm:col-span-1">
                <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                  Curator Rating (1.0 to 5.0)
                </label>
                <input
                  type="number"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  placeholder="5.0"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all text-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Narrative Descriptions */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">
              2. Expedition Narrative
            </h3>

            {/* Short Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                Short Catchy Teaser Description (max 180 chars)
              </label>
              <textarea
                rows={2}
                maxLength={180}
                placeholder="Write a brief, catchy summary card description displaying in catalogs (max 180 chars)..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl p-4 text-sm focus:outline-none transition-all text-neutral-900 resize-none"
              />
              <span className="text-[10px] text-neutral-400 text-right mt-1.5 font-mono">
                {shortDescription.length}/180 characters
              </span>
            </div>

            {/* Full Description */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-755 mb-2 block uppercase tracking-wider">
                Detailed Itinerary Description
              </label>
              <textarea
                rows={5}
                placeholder="Include accommodation specs, included options, meal plans, landmarks visited, and details to guide travelers..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl p-4 text-sm focus:outline-none transition-all text-neutral-900 resize-y"
              />
            </div>
          </div>

          {/* Section 3: Visual Assets & Live Preview */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">
              3. Visual Assets (URLs)
            </h3>

            <div className="space-y-4">
              {/* Image Input 1 */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-750 mb-1.5 block">
                  Featured Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imgUrl1}
                  onChange={(e) => setImgUrl1(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all text-neutral-900"
                />
              </div>

              {/* Image Input 2 */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-750 mb-1.5 block">
                  Secondary Gallery Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imgUrl2}
                  onChange={(e) => setImgUrl2(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all text-neutral-900"
                />
              </div>

              {/* Image Input 3 */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-neutral-750 mb-1.5 block">
                  Additional Gallery Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imgUrl3}
                  onChange={(e) => setImgUrl3(e.target.value)}
                  className="w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-primary rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all text-neutral-900"
                />
              </div>
            </div>

            {/* Live Card Assets Preview */}
            {(imgUrl1 || imgUrl2 || imgUrl3) && (
              <div className="pt-4">
                <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider block mb-3">Live Image Preview</span>
                <div className="flex gap-4 overflow-x-auto py-2">
                  {imgUrl1 && (
                    <div className="relative h-20 w-32 border border-neutral-200 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl1} alt="Cover Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">Cover</span>
                    </div>
                  )}
                  {imgUrl2 && (
                    <div className="relative h-20 w-32 border border-neutral-200 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl2} alt="Gallery 1 Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">Gallery 1</span>
                    </div>
                  )}
                  {imgUrl3 && (
                    <div className="relative h-20 w-32 border border-neutral-200 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl3} alt="Gallery 2 Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">Gallery 2</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-neutral-200">
            <Link
              href="/items/manage"
              className="px-6 py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={formLoading}
              className={`bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-8 text-sm rounded-xl transition-all shadow-sm ${
                formLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {formLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Publishing...</span>
                </div>
              ) : (
                "Publish Package"
              )}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
