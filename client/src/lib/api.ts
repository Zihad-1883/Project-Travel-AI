const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...customConfig } = options;
  
  // Build URL with query parameters, avoiding double slashes
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${baseUrl}${cleanPath}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Get auth token if available (client side)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("travel_ai_token");
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  const config: RequestInit = {
    method: "GET",
    ...customConfig,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText || _getHttpErrorMessage(response.status);
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error) {
    console.error(`API Fetch Error [${path}]:`, error);
    throw error;
  }
}

function _getHttpErrorMessage(status: number): string {
  switch (status) {
    case 400: return "Bad Request";
    case 401: return "Unauthorized - please log in again";
    case 403: return "Forbidden - you do not have permission for this action";
    case 404: return "Not Found";
    case 500: return "Internal Server Error";
    default: return "Something went wrong";
  }
}

// Health check endpoint helper definition
export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  env: string;
}

export async function getHealthCheck(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/api/health");
}
