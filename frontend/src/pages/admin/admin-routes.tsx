import { ADMIN_ROUTES } from "@/config/routes.config";
import {
  UsersPage,
} from ".";

const adminRoutes = [
  {
    path: ADMIN_ROUTES.USERS,
    element: <UsersPage />,
  },
];

export default adminRoutes;
