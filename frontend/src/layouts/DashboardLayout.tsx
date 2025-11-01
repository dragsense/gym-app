// React & Hooks
import type { ReactNode } from "react";
import { useId } from "react";

// External Libraries
import { Outlet } from "react-router-dom";

// Hooks
import { useI18n } from "@/hooks/use-i18n";

// Layout Components
import { AppSidebar } from "@/components/layout-ui/app-sidebar";
import { AppHeader } from "@/components/layout-ui/app-header";

// UI Components
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";



interface DashboardLayoutProps {
  children: ReactNode;
}



export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // React 19: Essential IDs
  const componentId = useId();
  const { t } = useI18n();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset
        className="w-100"
        data-component-id={componentId}
      >
        <AppHeader />

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
