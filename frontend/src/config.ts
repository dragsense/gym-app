export const config = {
  appName: import.meta.env.VITE_APP_NAME,
  apiUrl: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_BASE_API_PREFIX,
  baseUrl: import.meta.env.VITE_BASE_URL,
  publicUrl: import.meta.env.VITE_PUBLIC_URL,
  environment: import.meta.env.VITE_NODE_ENV,
  encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
  encryptionAlgorithm: import.meta.env.VITE_ENCRYPTION_ALGORITHM,
};