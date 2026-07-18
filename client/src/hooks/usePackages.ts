"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Package {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  duration: string;
  images: string[];
  rating: number;
  reviewsCount?: number;
  maxGroupSize?: number;
  tags?: string[];
  ownerAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackagesFilters {
  search?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface PackagesResponse {
  success: boolean;
  data: {
    packages: Package[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface PackageDetailsResponse {
  success: boolean;
  data: Package;
}

export function usePackages(filters: PackagesFilters) {
  const queryParams: Record<string, string> = {};

  if (filters.search) queryParams.search = filters.search;
  if (filters.location) queryParams.location = filters.location;
  if (filters.minPrice) queryParams.minPrice = filters.minPrice;
  if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
  if (filters.minRating) queryParams.minRating = filters.minRating;
  if (filters.sortBy) queryParams.sortBy = filters.sortBy;
  if (filters.page) queryParams.page = String(filters.page);
  if (filters.limit) queryParams.limit = String(filters.limit);

  return useQuery<PackagesResponse, Error>({
    queryKey: ["packages", filters],
    queryFn: () =>
      apiFetch<PackagesResponse>("/api/packages", {
        params: queryParams,
      }),
  });
}

export function usePackageDetails(id: string) {
  return useQuery<PackageDetailsResponse, Error>({
    queryKey: ["package", id],
    queryFn: () => apiFetch<PackageDetailsResponse>(`/api/packages/${id}`),
    enabled: !!id,
  });
}
