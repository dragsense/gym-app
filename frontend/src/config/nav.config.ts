import {
  Activity,
  type LucideIcon,
  UserCheck,
  FileText,
  CalendarClock,
  Database,
  Shield,
  Users,
  UserPlus,
  UserCog,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  Link,
  Home,
  User,
  Box,
  CardSim,
} from "lucide-react";
import {
  ADMIN_ROUTES,
  ADMIN_SEGMENT,
  CLIENT_SEGMENT,
  SUPER_ADMIN_SEGMENT,
  TRAINER_SEGMENT,
} from "./routes.config";
import { EUserLevels } from "@shared/enums";

// Navigation items type
export type NavItem = {
  title: string;
  icon?: LucideIcon;
  url: string;
  children?: {
    title: string;
    icon?: LucideIcon;
    url: string;
  }[];
};

// Common navigation items (shared across ALL user levels)
// Note: titles are translation keys, will be translated in sidebar component
const commonNavItems: NavItem[] = [
  {
    title: "dashboard",
    url: ADMIN_ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "sessions",
    url: ADMIN_ROUTES.SESSIONS,
    icon: Calendar,
  },
  {
    title: "billings",
    url: ADMIN_ROUTES.BILLINGS,
    icon: DollarSign,
  },
  {
    title: "referralLinks",
    url: ADMIN_ROUTES.REFERRAL_LINKS,
    icon: Link,
  },
  {
    title: "settings",
    url: ADMIN_ROUTES.SETTINGS,
    icon: Settings,
  },
  {
    title: "userAvailability",
    url: ADMIN_ROUTES.USER_AVAILABILITY,
    icon: Calendar,
  },
  {
    title: "account",
    url: ADMIN_ROUTES.ACCOUNT,
    icon: User,
  },
];

const adminAndTrainerSharedNavItems: NavItem[] = [
  {
    title: "clients",
    url: ADMIN_ROUTES.CLIENTS,
    icon: UserPlus,
  },
  {
    title: "activityLogs",
    url: ADMIN_ROUTES.ACTIVITY_LOGS,
    icon: Activity,
  },
];

// Shared navigation items (Admin & Trainer)
const superAdminAndAdminShared: NavItem[] = [
  ...adminAndTrainerSharedNavItems,
  {
    title: "users",
    url: ADMIN_ROUTES.USERS,
    icon: UserCheck,
  },
  {
    title: "trainers",
    url: ADMIN_ROUTES.TRAINERS,
    icon: Users,
  },
  {
    title: "trainerClients",
    url: ADMIN_ROUTES.TRAINER_CLIENTS,
    icon: UserCog,
  },
  {
    title: "roles",
    url: ADMIN_ROUTES.ROLES,
    icon: Shield,
  },
  {
    title: "products",
    url: ADMIN_ROUTES.PRODCUTS.INDEX,
    icon: Box,
    children: [
      {
        title: "inventory",
        url: ADMIN_ROUTES.PRODCUTS.INVENTORY,
        icon: CardSim,
      },
    ],
  },
];

// Super Admin-only navigation items
const superAdminNavItems: NavItem[] = [
  {
    title: "systemDashboard",
    url: ADMIN_ROUTES.SYSTEM_DASHBOARD,
    icon: Home,
  },
  ...commonNavItems,
  ...superAdminAndAdminShared,
  {
    title: "files",
    url: ADMIN_ROUTES.FILES,
    icon: FileText,
  },
  {
    title: "schedules",
    url: ADMIN_ROUTES.SCHEDULES,
    icon: CalendarClock,
  },
  {
    title: "queueBoard",
    url: ADMIN_ROUTES.QUEUE_BOARD,
    icon: BarChart3,
  },
  {
    title: "cache",
    url: ADMIN_ROUTES.CACHE,
    icon: Database,
  },
];

// Admin-only navigation items (Super Admin & Admin)
const adminNavItems: NavItem[] = [
  ...commonNavItems,
  ...superAdminAndAdminShared,
];

// Build navigation items by user level
const clientNavItems: NavItem[] = [...commonNavItems];

const trainerNavItems: NavItem[] = [
  ...commonNavItems,
  ...adminAndTrainerSharedNavItems,
];

// Export nav items organized by user level
export const navItemsByLevel = {
  [EUserLevels.SUPER_ADMIN]: () =>
    superAdminNavItems.map((item) => ({
      ...item,
      url: SUPER_ADMIN_SEGMENT + "/" + item.url,
      children: item.children?.map((child) => ({
        ...child,
        url: SUPER_ADMIN_SEGMENT + "/" + child.url,
      })),
    })),
  [EUserLevels.ADMIN]: () =>
    adminNavItems.map((item) => ({
      ...item,
      url: ADMIN_SEGMENT + "/" + item.url,
      children: item.children?.map((child) => ({
        ...child,
        url: ADMIN_SEGMENT + "/" + child.url,
      })),
    })),
  [EUserLevels.TRAINER]: () =>
    trainerNavItems.map((item) => ({
      ...item,
      url: TRAINER_SEGMENT + "/" + item.url,
      children: item.children?.map((child) => ({
        ...child,
        url: TRAINER_SEGMENT + "/" + child.url,
      })),
    })),
  [EUserLevels.CLIENT]: () =>
    clientNavItems.map((item) => ({
      ...item,
      url: CLIENT_SEGMENT + "/" + item.url,
      children: item.children?.map((child) => ({
        ...child,
        url: CLIENT_SEGMENT + "/" + child.url,
      })),
    })),
};

// Legacy export for backward compatibility (defaults to superAdmin)
export const navItems = superAdminNavItems;
