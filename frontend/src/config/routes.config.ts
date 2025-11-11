import { EUserLevels } from "@shared/enums";

// Common base routes
export const ROOT_ROUTE = "/" as const;
export const SUPER_ADMIN_SEGMENT = "/owner";
export const ADMIN_SEGMENT = "/admin";
export const TRAINER_SEGMENT = "/trainer";
export const CLIENT_SEGMENT = "/client";

export type RootRoute = typeof ROOT_ROUTE;

// Public routes
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_OTP: "/verify-otp",
} as const;
export type PublicRoute = keyof typeof PUBLIC_ROUTES;

// Admin-specific routes (relative paths for nested routing)
export const ADMIN_ROUTES = {
  SYSTEM_DASHBOARD: "system-dashboard",
  USERS: "users",
  TRAINERS: "trainers",
  CLIENTS: "clients",
  TRAINER_CLIENTS: "trainer-clients",
  SESSIONS: "sessions",
  BILLINGS: "billings",
  REFERRAL_LINKS: "referral-links",
  ACTIVITY_LOGS: "activity_logs",
  FILES: "files",
  SCHEDULES: "schedules",
  QUEUES: "queues",
  CACHE: "cache",
  QUEUE_BOARD: "admin/queues",
  DASHBOARD: "dashboard",
  WORKERS: "workers",
  ROLES: "roles",
  SETTINGS: "settings",
  USER_AVAILABILITY: "user-availability",
  ACCOUNT: "account",
  PRODCUTS: {
    INDEX: "products",
    INVENTORY: "products/inventory",
  },
} as const;
export type AdminRoute = keyof typeof ADMIN_ROUTES;

// Common routes
export const COMMON_ROUTES = {
  NOT_FOUND: "*",
  UNAUTHORIZED: "/unauthorized",
} as const;
export type CommonRoute = keyof typeof COMMON_ROUTES;

// Route titles are now translation keys - will be translated in components
export const ROUTE_TITLES: Record<string, string> = {
  [ADMIN_ROUTES.USERS]: "users",
  [ADMIN_ROUTES.TRAINERS]: "trainers",
  [ADMIN_ROUTES.CLIENTS]: "clients",
  [ADMIN_ROUTES.TRAINER_CLIENTS]: "trainerClients",
  [ADMIN_ROUTES.SESSIONS]: "sessions",
  [ADMIN_ROUTES.BILLINGS]: "billings",
  [ADMIN_ROUTES.REFERRAL_LINKS]: "referralLinks",
  [ADMIN_ROUTES.ACTIVITY_LOGS]: "activityLogs",
  [ADMIN_ROUTES.FILES]: "files",
  [ADMIN_ROUTES.SCHEDULES]: "schedules",
  [ADMIN_ROUTES.QUEUES]: "queueManagement",
  [ADMIN_ROUTES.QUEUE_BOARD]: "queueBoard",
  [ADMIN_ROUTES.DASHBOARD]: "dashboard",
  [ADMIN_ROUTES.WORKERS]: "workerManagement",
  [ADMIN_ROUTES.ROLES]: "roles",
  [ADMIN_ROUTES.SETTINGS]: "settings",
  [ADMIN_ROUTES.USER_AVAILABILITY]: "userAvailability",
  [ADMIN_ROUTES.ACCOUNT]: "account",
  [ADMIN_ROUTES.CACHE]: "cache",
  [ADMIN_ROUTES.SYSTEM_DASHBOARD]: "systemDashboard",
  [ADMIN_ROUTES.PRODCUTS.INDEX]: "products",
  [ADMIN_ROUTES.PRODCUTS.INVENTORY]: "inventory",
};

export const ROUTES_REDIRECTS = {
  [EUserLevels.SUPER_ADMIN]:
    SUPER_ADMIN_SEGMENT + "/" + ADMIN_ROUTES.SYSTEM_DASHBOARD,
  [EUserLevels.ADMIN]: ADMIN_SEGMENT + "/" + ADMIN_ROUTES.DASHBOARD,
  [EUserLevels.TRAINER]: TRAINER_SEGMENT + "/" + ADMIN_ROUTES.DASHBOARD,
  [EUserLevels.CLIENT]: CLIENT_SEGMENT + "/" + ADMIN_ROUTES.DASHBOARD,
} as const;

export const SEGMENTS = {
  [EUserLevels.SUPER_ADMIN]: SUPER_ADMIN_SEGMENT,
  [EUserLevels.ADMIN]: ADMIN_SEGMENT,
  [EUserLevels.TRAINER]: TRAINER_SEGMENT,
  [EUserLevels.CLIENT]: CLIENT_SEGMENT,
} as const;
