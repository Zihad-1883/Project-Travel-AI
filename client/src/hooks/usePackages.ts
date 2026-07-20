"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Package {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  fullDescription?: string;
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
  packages: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PackageDetailsResponse = Package;

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

export interface CreatePackageInput {
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  duration: string;
  location: string;
  images: string[];
  rating?: number;
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation<Package, Error, CreatePackageInput>({
    mutationFn: (body) =>
      apiFetch<Package>("/api/packages", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      // Invalidate target query lists to trigger refetches immediately
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/packages/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      // Invalidate target queries
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
    },
  });
}
