// Utils
import { apiRequest } from "@/utils/fetcher";
import { generateQueryParams } from "@/utils";

// Types
import type { IDashboardStats } from "@shared/interfaces/dashboard.interface";
import type { DashboardAnalyticsDto } from "@shared/dtos";

// Constants
const DASHBOARD_API_PATH = "/dashboard";

/**
 * Fetch dashboard stats
 */
export const fetchCombinedDashboardData = async (
  params?: Partial<DashboardAnalyticsDto>
): Promise<IDashboardStats> => {
  const queryParams = new URLSearchParams();

  if (params) {
    generateQueryParams(queryParams, params);
  }

  const url = `${DASHBOARD_API_PATH}/stats${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequest<IDashboardStats>(url, "GET");
};

/**
 * Fetch dashboard stats only
 */
export const fetchDashboardStats = async (
  params?: Partial<DashboardAnalyticsDto>
) => {
  const queryParams = new URLSearchParams();

  if (params) {
    generateQueryParams(queryParams, params);
  }

  const url = `${DASHBOARD_API_PATH}/stats${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequest<IDashboardStats>(url, "GET");
};

/**
 * Fetch sessions analytics
 */
export const fetchSessionsAnalytics = async (
  params?: Partial<DashboardAnalyticsDto>
) => {
  const queryParams = new URLSearchParams();

  if (params) {
    generateQueryParams(queryParams, params);
  }

  const url = `${DASHBOARD_API_PATH}/sessions/analytics${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequest(url, "GET");
};

/**
 * Fetch billing analytics
 */
export const fetchBillingAnalytics = async (
  params?: Partial<DashboardAnalyticsDto>
) => {
  const queryParams = new URLSearchParams();

  if (params) {
    generateQueryParams(queryParams, params);
  }

  const url = `${DASHBOARD_API_PATH}/billing/analytics${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return apiRequest(url, "GET");
};
