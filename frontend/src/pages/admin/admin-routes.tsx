import { lazy } from "react";
import { ADMIN_ROUTES } from "@/config/routes.config";
import { createRouteElement } from "@/lib/route-utils";
import { EUserLevels } from "@shared/enums";

// Route definition type
export type RouteDefinition = {
  path: string;
  element: React.ReactElement;
};

// React 19: Lazy load admin pages with enhanced performance
const UsersPage = lazy(() => import("./users"));
const TrainersPage = lazy(() => import("./trainers"));
const ClientsPage = lazy(() => import("./clients"));
const TrainerClientsPage = lazy(() => import("./trainer-clients"));
const SessionsPage = lazy(() => import("./sessions"));
const BillingsPage = lazy(() => import("./billings"));
const ReferralLinksPage = lazy(() => import("./referral-links"));
const ActivityLogsPage = lazy(() => import("./activity-logs"));
const FilesPage = lazy(() => import("./files"));
const SchedulesPage = lazy(() => import("./schedules"));
const WorkersPage = lazy(() => import("./workers"));
const RolesPage = lazy(() => import("./roles"));
const QueuesPage = lazy(() => import("./queues"));
const SettingsPage = lazy(() => import("./settings"));
const CachePage = lazy(() => import("./cache"));
const UserAvailabilityPage = lazy(() => import("./user-availability"));
const AccountPage = lazy(() => import("./account"));
const InventoryPage = lazy(() => import("./prodcuts/inventory"));
const DashboardPage = lazy(() => import("./dashboards/dashboard"));
const SystemDashboardPage = lazy(() => import("./dashboards/system-dashboard"));
// Helper to create route with component and user level
const createRoute = (
  path: string,
  Component: React.LazyExoticComponent<React.ComponentType<Record<string, never>>>,
  userLevel: string,
  message?: string | string[]
): RouteDefinition => ({
  path,
  element: createRouteElement(Component, userLevel, message),
});

// Common routes (shared across ALL user levels)
const commonRoutes = (userLevel: string): RouteDefinition[] => [
  createRoute(ADMIN_ROUTES.DASHBOARD, DashboardPage, userLevel, ["loading", "dashboard"]),
  createRoute(ADMIN_ROUTES.SESSIONS, SessionsPage, userLevel, ["loading", "sessions"]),
  createRoute(ADMIN_ROUTES.BILLINGS, BillingsPage, userLevel, ["loading", "billings"]),
  createRoute(ADMIN_ROUTES.REFERRAL_LINKS, ReferralLinksPage, userLevel, ["loading", "referral", "links"]),
  createRoute(ADMIN_ROUTES.SETTINGS, SettingsPage, userLevel, ["loading", "settings"]),
  createRoute(ADMIN_ROUTES.USER_AVAILABILITY, UserAvailabilityPage, userLevel, ["loading", "user", "availability"]),
  createRoute(ADMIN_ROUTES.ACCOUNT, AccountPage, userLevel, ["loading", "account"]),
];

// Routes shared by Admin and Trainer
const adminAndTrainerSharedRoutes = (userLevel: string): RouteDefinition[] => [
  createRoute(ADMIN_ROUTES.CLIENTS, ClientsPage, userLevel, ["loading", "clients"]),
  createRoute(ADMIN_ROUTES.ACTIVITY_LOGS, ActivityLogsPage, userLevel, ["loading", "activity", "logs"]),
];

// Routes shared by Super Admin and Admin
const superAdminAndAdminSharedRoutes = (userLevel: string): RouteDefinition[] => [
  ...adminAndTrainerSharedRoutes(userLevel),
  createRoute(ADMIN_ROUTES.USERS, UsersPage, userLevel, ["loading", "users"]),
  createRoute(ADMIN_ROUTES.TRAINERS, TrainersPage, userLevel, ["loading", "trainers"]),
  createRoute(ADMIN_ROUTES.TRAINER_CLIENTS, TrainerClientsPage, userLevel, ["loading", "trainer", "clients"]),
  createRoute(ADMIN_ROUTES.ROLES, RolesPage, userLevel, ["loading", "roles"]),
  createRoute(ADMIN_ROUTES.PRODCUTS.INVENTORY, InventoryPage, userLevel, ["loading", "inventory"]),
];

// Super Admin-only routes
const superAdminOnlyRoutes: RouteDefinition[] = [
  createRoute(ADMIN_ROUTES.SYSTEM_DASHBOARD, SystemDashboardPage, "Super Admin", ["loading", "system", "dashboard"]),
  createRoute(ADMIN_ROUTES.FILES, FilesPage, "Super Admin", ["loading", "files"]),
  createRoute(ADMIN_ROUTES.SCHEDULES, SchedulesPage, "Super Admin", ["loading", "schedules"]),
  createRoute(ADMIN_ROUTES.QUEUES, QueuesPage, "Super Admin", ["loading", "queues"]),
  createRoute(ADMIN_ROUTES.WORKERS, WorkersPage, "Super Admin", ["loading", "workers"]),
  createRoute(ADMIN_ROUTES.QUEUE_BOARD, QueuesPage, "Super Admin", ["loading", "queue", "board"]),
  createRoute(ADMIN_ROUTES.CACHE, CachePage, "Super Admin", ["loading", "cache"]),
];

// Build routes by user level
const superAdminRoutes: RouteDefinition[] = [
  ...superAdminOnlyRoutes,
  ...commonRoutes("Super Admin"),
  ...superAdminAndAdminSharedRoutes("Super Admin"),
];

const adminRoutes: RouteDefinition[] = [
  ...commonRoutes("Admin"),
  ...superAdminAndAdminSharedRoutes("Admin"),
];

const trainerRoutes: RouteDefinition[] = [
  ...commonRoutes("Trainer"),
  ...adminAndTrainerSharedRoutes("Trainer"),
];

const clientRoutes: RouteDefinition[] = [
  ...commonRoutes("Client"),
];

// Export routes organized by user level
export const adminRoutesByLevel = {
  [EUserLevels.SUPER_ADMIN]: superAdminRoutes,
  [EUserLevels.ADMIN]: adminRoutes,
  [EUserLevels.TRAINER]: trainerRoutes,
  [EUserLevels.CLIENT]: clientRoutes,
};

// Legacy export for backward compatibility
export default {
  superAdminRoutes,
  adminRoutes,
  trainerRoutes,
  clientRoutes,
};

