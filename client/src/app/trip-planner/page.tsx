"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRecommendations, TravelPreferences } from "@/hooks/useRecommendations";

export default function TripPlannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State definitions matching TravelPreferences
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [duration, setDuration] = useState("any");
  const [travelStyle, setTravelStyle] = useState("any");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInstruction, setCustomInstruction] = useState("");

  const recommendationMutation = useRecommendations();

  // Redirect if not logged in after loading concludes
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/trip-planner");
    }
  }, [user, loading, router]);

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleGenerateRecommendations = (e?: React.FormEvent, customPrefs?: TravelPreferences) => {
    if (e) e.preventDefault();
    
    const prefs: TravelPreferences = customPrefs || {
      location: location || undefined,
      maxPrice: maxPrice || undefined,
      duration: duration !== "any" ? duration : undefined,
      travelStyle: travelStyle !== "any" ? travelStyle : undefined,
      interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      customInstruction: customInstruction || undefined,
    };

    recommendationMutation.mutate(prefs);
  };

  // Preset quick adjustments
  const applyPresetRefinement = (type: "cheaper" | "shorter" | "luxury" | "adventure") => {
    const updatedPrefs: TravelPreferences = {
      location: location || undefined,
      maxPrice,
      duration: duration !== "any" ? duration : undefined,
      travelStyle: travelStyle !== "any" ? travelStyle : undefined,
      interests: selectedInterests.length > 0 ? selectedInterests : undefined,
      customInstruction,
    };

    if (type === "cheaper") {
      const newPrice = Math.max(800, Math.round(maxPrice * 0.7));
      setMaxPrice(newPrice);
      updatedPrefs.maxPrice = newPrice;
      updatedPrefs.customInstruction = "Show me more affordable alternatives.";
      setCustomInstruction("Show me more affordable alternatives.");
    } else if (type === "shorter") {
      setDuration("2-3 Days");
      updatedPrefs.duration = "2-3 Days";
      updatedPrefs.customInstruction = "Provide short weekend getaway options.";
      setCustomInstruction("Provide short weekend getaway options.");
    } else if (type === "luxury") {
      setTravelStyle("luxury");
      updatedPrefs.travelStyle = "luxury";
      setMaxPrice(8000);
      updatedPrefs.maxPrice = 8000;
      updatedPrefs.customInstruction = "Show high-end premium packages with high ratings.";
      setCustomInstruction("Show high-end premium packages with high ratings.");
    } else if (type === "adventure") {
      setTravelStyle("adventure");
      updatedPrefs.travelStyle = "adventure";
      if (!selectedInterests.includes("nature")) {
        setSelectedInterests([...selectedInterests, "nature"]);
        updatedPrefs.interests = [...(selectedInterests || []), "nature"];
      }
      updatedPrefs.customInstruction = "Focus on outdoor activities and sports.";
      setCustomInstruction("Focus on outdoor activities and sports.");
    }

    handleGenerateRecommendations(undefined, updatedPrefs);
  };

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-700 dark:text-neutral-400 font-medium">Securing planner details...</p>
        </div>
      </div>
    );
  }

  const interestOptions = [
    { id: "nature", label: "Mountain & Nature" },
    { id: "historical", label: "Historical Monuments" },
    { id: "gastronomy", label: "Local Food & Dining" },
    { id: "beach", label: "Beach & Coastline" },
    { id: "wellness", label: "Spa & Healing" },
    { id: "sports", label: "Extreme Adventure" },
  ];

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Title Header Section */}
      <div className="text-center mb-12">
        <h1 className="font-fraunces text-4xl sm:text-5xl font-semibold text-neutral-900 tracking-tight mb-4">
          AI Smart <span className="text-primary">Trip Planner</span>
        </h1>
        <p className="max-w-2xl mx-auto text-neutral-700 text-lg">
          Tune your travel specifications using AI-assisted curation to discover, rank, and book package templates matching your exact style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Preferences Tuning Form */}
        <form onSubmit={handleGenerateRecommendations} className="lg:col-span-4 bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-semibold text-neutral-900 border-b border-neutral-100 pb-3 font-fraunces">
            Preference Filters
          </h2>

          {/* Location field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 block">Where to?</label>
            <input
              type="text"
              placeholder="e.g., Paris, Tokyo, Bali"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-neutral-900">Max Budget Rate:</span>
              <span className="text-primary font-semibold font-mono">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>$500</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Duration select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 block">Length of Stay</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="any">Flexible Duration</option>
              <option value="2-3 Days">2 to 3 Days (Weekend)</option>
              <option value="4-7 Days">4 to 7 Days (Short Break)</option>
              <option value="8-14 Days">8 to 14 Days (Standard Trip)</option>
              <option value="15+ Days">15+ Days (Long Venture)</option>
            </select>
          </div>

          {/* Travel style select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 block">Travel Style</label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm appearance-none"
            >
              <option value="any">Flexible Style</option>
              <option value="luxury">💎 Luxury Experience</option>
              <option value="budget">🍃 Budget-conscious</option>
              <option value="adventure">🏔️ Active Adventure</option>
              <option value="culture">🏺 Culture & Heritage</option>
              <option value="relaxation">🌴 Pure Relaxation</option>
            </select>
          </div>

          {/* Interest tags list */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-900 block">Interests & Vibes</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => {
                const active = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleInterestToggle(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border ${
                      active
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom refinement note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-900 block">Custom Prompts / Instructions</label>
            <textarea
              placeholder="e.g., Must offer child-friendly sights, seafood hotspots, or art galleries..."
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              rows={3}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={recommendationMutation.isPending}
            className={`w-full py-4 rounded-2xl text-white font-medium cursor-pointer transition-all duration-300 shadow-sm ${
              recommendationMutation.isPending
                ? "bg-neutral-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark active:scale-[0.98]"
            }`}
          >
            {recommendationMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></span>
                Curating matches...
              </span>
            ) : (
              "Generate AI Matches"
            )}
          </button>
        </form>

        {/* Right Side: Results Showcase */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick presets bar for quick adjustments */}
          {recommendationMutation.data && (
            <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-900 font-mono uppercase tracking-wider mr-2">
                Quick Adjustments:
              </span>
              <button
                type="button"
                onClick={() => applyPresetRefinement("cheaper")}
                className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                💸 Make it cheaper
              </button>
              <button
                type="button"
                onClick={() => applyPresetRefinement("shorter")}
                className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                ⏱️ Make it shorter
              </button>
              <button
                type="button"
                onClick={() => applyPresetRefinement("luxury")}
                className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                💎 Luxury Focus
              </button>
              <button
                type="button"
                onClick={() => applyPresetRefinement("adventure")}
                className="bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
              >
                🏔️ Adventure Style
              </button>
            </div>
          )}

          {recommendationMutation.isIdle && (
            <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm min-h-[40vh] flex flex-col justify-center items-center">
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="font-fraunces text-xl font-semibold text-neutral-900 mb-2">No active recommendation search</h3>
              <p className="text-neutral-700 max-w-sm mb-6 text-sm">
                Enter your settings in the panel on the left and click &quot;Generate AI Matches&quot; to launch search computations grounded in our database.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    setLocation("Kyoto");
                    setTravelStyle("culture");
                    handleGenerateRecommendations(undefined, { location: "Kyoto", travelStyle: "culture" });
                  }}
                  className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ⛩️ Cultural Kyoto
                </button>
                <button
                  onClick={() => {
                    setLocation("Bali");
                    setTravelStyle("relaxation");
                    handleGenerateRecommendations(undefined, { location: "Bali", travelStyle: "relaxation" });
                  }}
                  className="bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 border border-neutral-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  🌴 Relaxing Bali
                </button>
              </div>
            </div>
          )}

          {recommendationMutation.isPending && (
            <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm min-h-[40vh] flex flex-col justify-center items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-primary">AI</div>
              </div>
              <div>
                <h3 className="font-fraunces text-lg font-semibold text-neutral-900">Comparing package templates...</h3>
                <p className="text-neutral-700 text-sm max-w-sm mt-1">
                  Our agency model is matching your requirements with live destination templates.
                </p>
              </div>
            </div>
          )}

          {recommendationMutation.isError && (
            <div className="bg-red-50 border border-red-100 text-red-800 rounded-3xl p-8 text-center space-y-3">
              <p className="font-semibold">AI Recommendation Service is temporarily unavailable.</p>
              <p className="text-sm text-red-700">{recommendationMutation.error?.message || "Please reload and try again."}</p>
              <button
                type="button"
                onClick={() => handleGenerateRecommendations()}
                className="bg-red-800 hover:bg-red-950 text-white font-medium text-xs px-4 py-2 rounded-xl"
              >
                Retry Request
              </button>
            </div>
          )}

          {recommendationMutation.data && recommendationMutation.data.recommendations.length === 0 && (
            <div className="bg-white border border-neutral-100 rounded-3xl p-12 text-center shadow-sm">
              <h3 className="font-fraunces text-lg font-semibold text-neutral-900 mb-2">No matching packages found</h3>
              <p className="text-neutral-700 text-sm max-w-md mx-auto">
                We couldn&apos;t find matches within your specific price, duration, or location guidelines. Try raising your budget limit or broadening your destination tags!
              </p>
            </div>
          )}

          {recommendationMutation.data && recommendationMutation.data.recommendations.length > 0 && (
            <div className="space-y-6">
              {recommendationMutation.data.recommendations.map((rec) => {
                const pkg = rec.package;
                if (!pkg) return null;

                // Color coding index for matching values
                const scoreColor = 
                  rec.matchScore >= 90 ? "text-primary bg-primary/10 border-primary/20" :
                  rec.matchScore >= 75 ? "text-accent bg-accent/10 border-accent/20" :
                  "text-neutral-700 bg-neutral-100 border-neutral-200";

                const scoreBarClass =
                  rec.matchScore >= 90 ? "bg-primary" :
                  rec.matchScore >= 75 ? "bg-accent" :
                  "bg-neutral-400";

                return (
                  <div
                    key={pkg._id}
                    className="bg-white border border-neutral-100 hover:border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12"
                  >
                    {/* Left: Product visual preview */}
                    <div className="md:col-span-4 relative min-h-[220px] md:min-h-full bg-neutral-100">
                      {pkg.images && pkg.images.length > 0 ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={pkg.images[0]}
                          alt={pkg.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                          No Preview
                        </div>
                      )}
                      
                      {/* Match Index Badge Overlay */}
                      <span className={`absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${scoreColor}`}>
                        💡 {rec.matchScore}% Match
                      </span>
                    </div>

                    {/* Right: Specifications & AI Analysis details */}
                    <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-secondary text-xs font-semibold uppercase tracking-wider font-mono">
                            {pkg.location} • {pkg.duration}
                          </span>
                          <span className="text-neutral-900 font-bold font-mono text-lg">
                            ${pkg.price}
                          </span>
                        </div>
                        <h3 className="font-fraunces text-2xl font-semibold text-neutral-900 hover:text-primary transition-colors">
                          <Link href={`/packages/${pkg._id}`}>{pkg.title}</Link>
                        </h3>
                        <p className="text-neutral-700 text-sm line-clamp-2">
                          {pkg.shortDescription}
                        </p>
                      </div>

                      {/* AI recommendations logic container */}
                      <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono bg-primary text-white px-2 py-0.5 rounded">
                            AI Grounding Analysis
                          </span>
                          {/* Score progression visualizer */}
                          <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div className={`h-full ${scoreBarClass}`} style={{ width: `${rec.matchScore}%` }}></div>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                          {rec.matchReason}
                        </p>
                      </div>

                      {/* Quick CTA panel */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <Link
                          href={`/packages/${pkg._id}`}
                          className="w-full sm:w-auto text-center border border-neutral-200 hover:bg-neutral-50 text-neutral-700 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/packages/${pkg._id}?customize=true`}
                          className="w-full sm:w-auto text-center bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95 shadow-sm"
                        >
                          Request Custom Itinerary
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
