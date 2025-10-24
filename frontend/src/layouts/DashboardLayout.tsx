// React & Hooks
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useId, useDeferredValue, useMemo } from "react";

// External Libraries
import { Outlet } from "react-router-dom";

// Config
import { ROUTE_TITLES } from "@/config/routes.config";

// Hooks
import { useI18n } from "@/hooks/use-i18n";


// Layout Components
import { AppSidebar } from "@/components/layout-ui/app-sidebar";
import { AppHeader } from "@/components/layout-ui/app-header";

// Utilities
import { matchRoutePath } from "@/lib/utils";

// UI Components
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";



interface DashboardLayoutProps {
  children: ReactNode;
}



export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // React 19: Essential IDs
  const componentId = useId();
  const { t } = useI18n();

  const location = useLocation();

  // React 19: Memoized route title calculation for better performance
  const title = useMemo(() => {
    if (ROUTE_TITLES[location.pathname]) {
      return ROUTE_TITLES[location.pathname];
    }

    for (const [pattern, title] of Object.entries(ROUTE_TITLES)) {
      if (pattern.includes(":") && matchRoutePath(pattern, location.pathname)) {
        return title;
      }
    }

    return "Unknown Page";
  }, [location.pathname]);

  // React 19: Deferred title for better performance during navigation
  const deferredTitle = useDeferredValue(title);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className="w-100"
        data-component-id={componentId}
      >
        <AppHeader title={deferredTitle} />

        <div className="flex flex-1 flex-col p-4 lg:px-6 pb-20">

          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>


        </div>


        <footer className="text-center py-2 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t('appName')}
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayoutWrapper() {

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
