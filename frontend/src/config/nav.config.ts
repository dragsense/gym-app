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
const commonNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: ADMIN_ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "Sessions",
    url: ADMIN_ROUTES.SESSIONS,
    icon: Calendar,
  },
  {
    title: "Billings",
    url: ADMIN_ROUTES.BILLINGS,
    icon: DollarSign,
  },
  {
    title: "Referral Links",
    url: ADMIN_ROUTES.REFERRAL_LINKS,
    icon: Link,
  },
  {
    title: "Settings",
    url: ADMIN_ROUTES.SETTINGS,
    icon: Settings,
  },
  {
    title: "User Availability",
    url: ADMIN_ROUTES.USER_AVAILABILITY,
    icon: Calendar,
  },
  {
    title: "Account",
    url: ADMIN_ROUTES.ACCOUNT,
    icon: User,
  },
];

const adminAndTrainerSharedNavItems: NavItem[] = [
  {
    title: "Clients",
    url: ADMIN_ROUTES.CLIENTS,
    icon: UserPlus,
  },
  {
    title: "Activity Logs",
    url: ADMIN_ROUTES.ACTIVITY_LOGS,
    icon: Activity,
  },
];

// Shared navigation items (Admin & Trainer)
const superAdminAndAdminShared: NavItem[] = [
  ...adminAndTrainerSharedNavItems,
  {
    title: "Users",
    url: ADMIN_ROUTES.USERS,
    icon: UserCheck,
  },
  {
    title: "Trainers",
    url: ADMIN_ROUTES.TRAINERS,
    icon: Users,
  },
  {
    title: "Trainer-Clients",
    url: ADMIN_ROUTES.TRAINER_CLIENTS,
    icon: UserCog,
  },
  {
    title: "Roles",
    url: ADMIN_ROUTES.ROLES,
    icon: Shield,
  },
];

// Super Admin-only navigation items
const superAdminNavItems: NavItem[] = [
  {
    title: "System Dashboard",
    url: ADMIN_ROUTES.SYSTEM_DASHBOARD,
    icon: Home,
  },
  ...commonNavItems,
  ...superAdminAndAdminShared,
  {
    title: "Files",
    url: ADMIN_ROUTES.FILES,
    icon: FileText,
  },
  {
    title: "Schedules",
    url: ADMIN_ROUTES.SCHEDULES,
    icon: CalendarClock,
  },
  {
    title: "Queue Board",
    url: ADMIN_ROUTES.QUEUE_BOARD,
    icon: BarChart3,
  },
  {
    title: "Cache",
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
    })),
  [EUserLevels.ADMIN]: () =>
    adminNavItems.map((item) => ({
      ...item,
      url: ADMIN_SEGMENT + "/" + item.url,
    })),
  [EUserLevels.TRAINER]: () =>
    trainerNavItems.map((item) => ({
      ...item,
      url: TRAINER_SEGMENT + "/" + item.url,
    })),
  [EUserLevels.CLIENT]: () =>
    clientNavItems.map((item) => ({
      ...item,
      url: CLIENT_SEGMENT + "/" + item.url,
    })),
};

// Legacy export for backward compatibility (defaults to superAdmin)
export const navItems = superAdminNavItems;
