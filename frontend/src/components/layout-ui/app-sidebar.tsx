import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, LogOutIcon, X } from "lucide-react";
import { useId, useTransition } from "react";

// UI Components
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Config
import { navItemsByLevel } from "@/config/nav.config";
import { ROOT_ROUTE } from "@/config/routes.config";

// Utils
import { matchRoutePath } from "@/lib/utils";

// Hooks
import { useLogout } from "@/hooks/use-logout";
import { useAuthUser } from "@/hooks/use-auth-user";

// Assets
import logo from "@/assets/logos/logo.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  themeClass?: string;
}

export function AppSidebar({
  themeClass = "",
  ...props
}: AppSidebarProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const location = useLocation();
  const { logout, isLoading } = useLogout();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useAuthUser();

  // Get navigation items based on user level
  const navItems = React.useMemo(() => {
    if (!user) return [];
    return navItemsByLevel[user.level]() || [];
  }, [user]);

  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          matchRoutePath(child.url, location.pathname)
        );
        const isParentActive = item.urls.some((url) =>
          matchRoutePath(url, location.pathname)
        );
        newExpandedItems[item.title] =
          isChildActive || isParentActive || item.title === "Dashboard";
      }
    });
    setExpandedItems(newExpandedItems);
  }, [location.pathname, navItems]);

  // Auto-close mobile sidebar on route change
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);

  // React 19: Smooth sidebar interactions
  const toggleExpanded = (title: string) => {
    startTransition(() => {
      setExpandedItems((prev) => ({
        ...prev,
        [title]: !prev[title],
      }));
    });
  };

  // React 19: Memoized sidebar header for better performance
  const renderSidebarHeader = React.useMemo(() => (showCloseButton: boolean = false) => (
    <SidebarHeader className="mt-5" data-component-id={componentId}>
      <div className={showCloseButton ? "flex items-center justify-between p-4" : ""}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:bg-transparent">
              <Link to={ROOT_ROUTE} className="h-13">
                <img src={logo} className="h-full object-contain" />
                <span className="text-900 text-xl uppercase">Formance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {showCloseButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startTransition(() => setOpenMobile(false))}
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </SidebarHeader>
  ), [componentId, setOpenMobile, startTransition]);

  const renderNavItems = () => (
    <SidebarContent className="mt-2">
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu className="gap-3">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[item.title];

              if (hasChildren) {
                return (
                  <Collapsible
                    key={item.title}
                    open={isExpanded}
                    onOpenChange={() => toggleExpanded(item.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>

                        <SidebarMenuButton
                          isActive={matchRoutePath(item.url, location.pathname)}

                          tooltip={item.title}
                          className="group cursor-pointer text-muted-foreground/50 p-6 rounded-xl hover:bg-muted/50 transition-all duration-200"
                        >
                          {item.icon && <item.icon className="group-data-[active=true]:text-background h-6 w-6" />}
                          <span className="font-medium">{item.title}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-4">
                          {item.children?.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={location.pathname === child.url}
                                className="group cursor-pointer text-muted-foreground/50 p-4 rounded-xl hover:bg-muted/50 transition-all duration-200"
                              >
                                <Link to={child.url}>
                                  {child.icon && (
                                    <child.icon className="group-data-[active=true]:text-background hover:text-background h-5 w-5" />
                                  )}
                                  <span className="font-medium">{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>


                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <Link to={item.url}>


                    <SidebarMenuButton
                      isActive={matchRoutePath(item.url, location.pathname)}

                      tooltip={item.title}
                      className="group cursor-pointer text-muted-foreground/50 p-6 rounded-xl hover:bg-muted/50 transition-all duration-200"
                    >
                      {item.icon && <item.icon className="group-data-[active=true]:text-background hover:text-background h-6 w-6" />}
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );

  const renderSidebarFooter = () => (
    <SidebarFooter>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="justify-start gap-2 mb-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOutIcon className="h-4 w-4" />
            )}
            {isLoading ? "Logging out..." : "Log out"}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Logout Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => startTransition(() => logout(false))}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Log out (this device)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startTransition(() => logout(true))}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Log out from all devices
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsible="offcanvas"
          themeClass={themeClass}
          {...props}
        >
          {renderSidebarHeader()}
          {renderNavItems()}
          {renderSidebarFooter()}
        </Sidebar>
      </div>

      {/* Mobile Sidebar with Close Button */}
      <div className="md:hidden">
        <Sidebar
          collapsible="offcanvas"
          themeClass={themeClass}
          {...props}
        >
          {renderSidebarHeader(true)}
          {renderNavItems()}
          {renderSidebarFooter()}
        </Sidebar>
      </div>
    </>
  );
}