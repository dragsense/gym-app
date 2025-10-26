import { lazy, Suspense, useId } from "react";
import { ADMIN_ROUTES } from "@/config/routes.config";
import { AppLoader } from "@/components/layout-ui/app-loader";

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
const DashboardPage = lazy(() => import("./dashboard").then(module => ({ default: module.DashboardPage })));
const WorkersPage = lazy(() => import("./workers"));
const RolesPage = lazy(() => import("./roles"));
const QueuesPage = lazy(() => import("./queues"));

const SettingsPage = lazy(() => import("./settings"));
const CachePage = lazy(() => import("./cache"));
const UserAvailabilityPage = lazy(() => import("./user-availability"));
// React 19: Enhanced loading component for admin routes
const AdminRouteLoadingFallback = () => {
  const componentId = useId();

  return (

    <AppLoader>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Admin Panel</h3>
        <p className="text-sm text-muted-foreground">Loading dashboard and management tools...</p>
      </div>
    </AppLoader>

  );
};

// React 19: Enhanced admin routes with lazy loading and Suspense
const adminRoutes = [
  {
    path: ADMIN_ROUTES.DASHBOARD,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <DashboardPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.USERS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <UsersPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.TRAINERS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <TrainersPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.CLIENTS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <ClientsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.TRAINER_CLIENTS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <TrainerClientsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.SESSIONS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <SessionsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.BILLINGS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <BillingsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.REFERRAL_LINKS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <ReferralLinksPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.ACTIVITY_LOGS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <ActivityLogsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.FILES,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <FilesPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.SCHEDULES,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <SchedulesPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.QUEUES,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <QueuesPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.WORKERS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <WorkersPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.ROLES,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <RolesPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.QUEUE_BOARD,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <QueuesPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.SETTINGS,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <SettingsPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.USER_AVAILABILITY,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <UserAvailabilityPage />
      </Suspense>
    ),
  },
  {
    path: ADMIN_ROUTES.CACHE,
    element: (
      <Suspense fallback={<AdminRouteLoadingFallback />}>
        <CachePage />
      </Suspense>
    ),
  },
];

export default adminRoutes;
