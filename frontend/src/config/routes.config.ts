// Common base routes
export const ROOT_ROUTE = "/" as const;
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


// Admin-specific routes
export const ADMIN_ROUTES = {
  USERS: "/users",
  TRAINERS: "/trainers",
  CLIENTS: "/clients",
  TRAINER_CLIENTS: "/trainer-clients",
  SESSIONS: "/sessions",
  ACTIVITY_LOGS: '/activity_logs',
  FILES: '/files',
  SCHEDULES: '/schedules',
  QUEUES: '/queues',
  DASHBOARD: '/dashboard',
  WORKERS: '/workers',
  ROLES: '/roles'
} as const;
export type AdminRoute = keyof typeof ADMIN_ROUTES;


// Common routes
export const COMMON_ROUTES = {
  NOT_FOUND: "*",
  UNAUTHORIZED: "/unauthorized",
} as const;
export type CommonRoute = keyof typeof COMMON_ROUTES;


export const ROUTE_TITLES: Record<string, string> = {
    [ADMIN_ROUTES.USERS]: "Users",
    [ADMIN_ROUTES.TRAINERS]: "Trainers",
    [ADMIN_ROUTES.CLIENTS]: "Clients",
    [ADMIN_ROUTES.TRAINER_CLIENTS]: "Trainer-Clients",
    [ADMIN_ROUTES.SESSIONS]: "Sessions",
    [ADMIN_ROUTES.ACTIVITY_LOGS]: "Activity Logs",
    [ADMIN_ROUTES.FILES]: "Files",
    [ADMIN_ROUTES.SCHEDULES]: "Schedules",
    [ADMIN_ROUTES.QUEUES]: "Queue Management",
    [ADMIN_ROUTES.DASHBOARD]: "Dashboard",
    [ADMIN_ROUTES.WORKERS]: "Worker Management"
};