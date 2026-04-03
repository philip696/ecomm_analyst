/**
 * Axios instance pre-configured to talk to the FastAPI backend.
 * Automatically attaches the JWT Bearer token from localStorage.
 */
import axios from "axios";

// Detect the API URL based on environment
function getApiUrl(): string {
  // 1. Use explicitly set env variable (build-time)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. For local development
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:8000";
  }

  // 3. For production on Cloudflare Pages, derive Worker URL from domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    
    // If deployed to ecomm-analyst.pages.dev or preview domain
    if (hostname.includes("ecomm-analyst.pages.dev") || hostname.includes(".pages.dev")) {
      return "https://ecomm-analyst.philip-dewanto.workers.dev";
    }
  }

  // 4. Fallback (shouldn't reach here)
  return "http://localhost:8000";
}

const resolvedBaseUrl = getApiUrl();

const api = axios.create({
  baseURL: resolvedBaseUrl,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Typed API helpers ─────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", new URLSearchParams({ username: email, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  register: (email: string, username: string, password: string) =>
    api.post("/api/auth/register", { email, username, password }),
  me: () => api.get("/api/auth/me"),
};

export const dashboardApi = {
  summary: () => api.get("/api/dashboard/summary"),
};

export const productsApi = {
  list: (params?: object) => api.get("/api/products/", { params }),
};

export const salesApi = {
  trends: (days = 30, marketplace?: string) => api.get("/api/sales/analytics/trends", { params: { days, marketplace } }),
  topProducts: (limit = 5, marketplace?: string) => api.get("/api/sales/analytics/top-products", { params: { limit, marketplace } }),
  mostReturned: (limit = 5, marketplace?: string) => api.get("/api/sales/analytics/most-returned", { params: { limit, marketplace } }),
  bundledItems: (limit = 5, marketplace?: string) => api.get("/api/sales/analytics/bundled-items", { params: { limit, marketplace } }),
  competitorPricing: (productId?: number, marketplace?: string) =>
    api.get("/api/sales/analytics/competitor-pricing", {
      params: { ...(productId ? { product_id: productId } : {}), marketplace },
    }),
};

export const engagementApi = {
  trends: (days = 30) => api.get("/api/engagement/analytics/trends", { params: { days } }),
  topViewed: (limit = 5) => api.get("/api/engagement/analytics/top-viewed", { params: { limit } }),
  imageViews: (limit = 5) => api.get("/api/engagement/analytics/image-views", { params: { limit } }),
};

export const commentsApi = {
  topPositive: (limit = 5) => api.get("/api/comments/analytics/top-positive", { params: { limit } }),
  topNegative: (limit = 5) => api.get("/api/comments/analytics/top-negative", { params: { limit } }),
  sentimentSummary: () => api.get("/api/comments/analytics/sentiment-summary"),
  wordFrequency: (sentiment?: string, limit = 20) =>
    api.get("/api/comments/analytics/word-frequency", {
      params: { limit, ...(sentiment ? { sentiment } : {}) },
    }),
  themes: () => api.get("/api/comments/analytics/themes"),
};

export const insightsApi = {
  ask: (segments: string[], question: string) =>
    api.post("/api/insights/ask", { segments, question }),
  history: (limit = 20) => api.get("/api/insights/history", { params: { limit } }),
};
