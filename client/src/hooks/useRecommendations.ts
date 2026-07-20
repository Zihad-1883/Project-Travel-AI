"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Package } from "./usePackages";

export interface TravelPreferences {
  location?: string;
  maxPrice?: number;
  duration?: string;
  travelStyle?: string;
  interests?: string[];
  customInstruction?: string;
}

export interface RecommendationResult {
  packageId: string;
  matchScore: number;
  matchReason: string;
  package?: Package;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: RecommendationResult[];
}

export interface LogInteractionInput {
  packageId: string;
  type: "view" | "save";
}

export function useRecommendations() {
  return useMutation<RecommendationsResponse, Error, TravelPreferences>({
    mutationFn: (preferences) =>
      apiFetch<RecommendationsResponse>("/api/ai/recommend", {
        method: "POST",
        body: JSON.stringify({ preferences }),
      }),
  });
}

export function useLogInteraction() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; interaction: Record<string, unknown> }, Error, LogInteractionInput>({
    mutationFn: (body) =>
      apiFetch<{ success: boolean; interaction: Record<string, unknown> }>("/api/users/interactions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // Invalidate interactions query if we decide to list them anywhere
      queryClient.invalidateQueries({ queryKey: ["user-interactions"] });
    },
  });
}
