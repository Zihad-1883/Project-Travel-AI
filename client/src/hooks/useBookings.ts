"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Package } from "./usePackages";

export interface Booking {
  _id: string;
  userId: string;
  packageId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  packageDetails?: Package;
  userDetails?: {
    name: string;
    email: string;
  };
}

export function useBookings() {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings"],
    queryFn: () => apiFetch<Booking[]>("/api/bookings"),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { packageId: string }>({
    mutationFn: (body) =>
      apiFetch<Booking>("/api/bookings", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation<Booking, Error, { id: string; status: "approved" | "rejected" }>({
    mutationFn: ({ id, status }) =>
      apiFetch<Booking>(`/api/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      // Invalidate both traveler and admin queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
