import { ADMIN_ROUTES } from "@/config/routes.config";
import UsersPage from "./users";
import ActivityLogsPage from "./activity-logs";
import FilesPage from "./files";
import SchedulesPage from "./schedules";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.USERS,
    element: <UsersPage />,
  },
  {
    path: ADMIN_ROUTES.ACTIVITY_LOGS,
    element: <ActivityLogsPage />,
  },
  {
    path: ADMIN_ROUTES.FILES,
    element: <FilesPage />,
  },
  {
    path: ADMIN_ROUTES.SCHEDULES,
    element: <SchedulesPage />,
  },
];

export default adminRoutes;
