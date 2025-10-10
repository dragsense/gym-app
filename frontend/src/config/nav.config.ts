import {Activity, type LucideIcon, UserCheck } from "lucide-react";
import { ADMIN_ROUTES } from "./routes.config";

// Separate settings configuration object

export const navItems: {
    title: string;
    icon?: LucideIcon;
    urls: string[];
    children?: {
        title: string;
        icon?: LucideIcon;
        url: string;
    }[];
}[] = [
   
        {
            title: "Users",
            urls: [ADMIN_ROUTES.USERS],
            icon: UserCheck,
        },
        {
            title: "Activit Logs",
            urls: [ADMIN_ROUTES.ACTIVITY_LOGS],
            icon: Activity,
        },
    ];


