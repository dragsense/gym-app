import { ADMIN_ROUTES } from "@/config/routes.config";
import UsersPage from "./users";
import ActivityLogsPage from "./activity-logs";
import FilesPage from "./files";

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
];

export default adminRoutes;
