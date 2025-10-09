import axios, { type AxiosRequestConfig, AxiosHeaders } from "axios";
import { config } from "@/config";
import { DecryptionService } from "@/lib/decryption.service";

const decryptionService = new DecryptionService();
export const BASE_API_URL = config.apiUrl;

let csrfTokenCache: string | null = null;
let accessToken: string | null = null;
// Fetch CSRF token
const getCsrfToken = async (): Promise<string> => {
  if (csrfTokenCache) return csrfTokenCache;

  try {
    const res = await axios.get(`${BASE_API_URL}/csrf-token`, {
      withCredentials: true,
    });

    csrfTokenCache = res.data.csrfToken;
    return csrfTokenCache!;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }

  return '';

};

// Axios instance
const api = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});


const refreshApi = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

// Request interceptor: set CSRF token
api.interceptors.request.use(async (config) => {
  const csrfToken = await getCsrfToken();

  // Ensure headers is AxiosHeaders
  if (!config.headers) config.headers = new AxiosHeaders();
  (config.headers as AxiosHeaders).set("X-CSRF-Token", csrfToken);

  return config;
});

// Response interceptor: handle 401 / refresh token
api.interceptors.response.use(
  async (response) => {
    if (response.data?.accessToken?.token) {
      accessToken = response.data.accessToken.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const csrf = await getCsrfToken();

      try {
        const res = await refreshApi.post(
          "/auth/refresh",
          {},
          { headers: { "X-CSRF-Token": csrf }, withCredentials: true }
        );

        accessToken = res.data.accessToken?.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Generic fetcher with decryption
const fetcher = async <T>(fetchConfig: AxiosRequestConfig): Promise<T> => {
  const isDevelopment = config.environment === 'development';

  try {
    const res = await api.request(fetchConfig);

    if (fetchConfig.responseType === "arraybuffer" || fetchConfig.responseType === "blob") {
      return res as unknown as T;
    }

    if (res.status === 204) return null as T;

    const payload = res.data;

    if (payload && typeof payload === 'object' && payload.encrypted) {
      try {
        const decryptedData = await decryptionService.decryptResponse(payload);
        return decryptedData as T;
      } catch (decryptError) {
        throw new Error("Failed to decrypt response data");
      }
    }

    return payload as T;
  } catch (error: any) {
    // Log full error in development only
    if (isDevelopment) {
      console.error('API Error:', error);
      console.error('Response data:', error.response?.data);
      if (error.response?.data?.stack) {
        console.error('Stack trace:', error.response.data.stack);
      }
    }

    // Extract error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      "Something went wrong";

    // In development, show detailed error with status code and stack
    if (isDevelopment) {
      const statusCode = error.response?.status;
      const stack = error.response?.data?.stack;
      const exceptionType = error.response?.data?.exceptionType;
      
      let errorMessage = message;
      
      if (statusCode) {
        errorMessage += ` (Status: ${statusCode})`;
      }
      
      if (exceptionType) {
        errorMessage += ` [${exceptionType}]`;
      }
      
      const detailedError = new Error(errorMessage);
      
      // Attach stack trace if available
      if (stack) {
        detailedError.stack = `${detailedError.stack}\n\nServer Stack:\n${stack}`;
      }
      
      throw detailedError;
    }

    // In production, only show the error message without technical details
    throw new Error(message);  
  }
};

// JSON request
export const apiRequest = async <T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> => {
  return fetcher<T>({
    url: path,
    method,
    headers: new AxiosHeaders({ "Content-Type": "application/json" }),
    data: body ?? undefined,
  });
};

// File request
export const apiFileRequest = async <T>(
  path: string,
  method: "POST" | "PATCH" | "PUT",
  data: FormData
): Promise<T> => {
  return fetcher<T>({
    url: path,
    method,
    data,
  });
};


export const downloadFile = async (path: string, fileName?: string) => {
  const res = await fetcher<any>({
    url: path, method: "GET",
    responseType: "arraybuffer",
  });


  const blob = new Blob([res.data])
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName || `file_${Date.now()}`;
  link.click();
  window.URL.revokeObjectURL(link.href);
};