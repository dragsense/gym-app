// External Libraries
import { User, Mail, LogOut, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";



interface AppHeaderProps {
  title: string;
}

// Use separate settings config object

export function AppHeader({ title }: AppHeaderProps) {
  const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthUser();
  const { logout, isLoading } = useLogout();

  // Close desktop settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsDesktopSettingsOpen(false);
      }
    };

    if (isDesktopSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDesktopSettingsOpen]);

  const firstName = user?.profile?.firstName || "Unknown";
  const fullName = user ? `${user?.profile?.firstName} ${user?.profile?.lastName}` : "Unknown";
  const email = user?.email || "Unknown";

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-20 flex h-30 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
      <div className="flex flex-row w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex flex-1 items-center gap-4" ref={settingsRef}>
          <SidebarTrigger className="-ml-1 block md:hidden" />
        </div>

        <div className="flex items-center gap-5 p-4 text-left text-sm bg-header rounded-full p-4 shadow-sm">          
          {/* Profile Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-all duration-200 rounded-lg"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* User image */}
                  <AvatarImage src={undefined} alt={firstName} />

                  {/* Fallback: initials or icon */}
                  <AvatarFallback className="rounded-lg bg-foreground/2 flex items-center justify-center">
                    {firstName ? (
                      firstName.substring(0, 2).toUpperCase() // show initials
                    ) : (
                      <User className="w-4 h-4" /> // show icon if no name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="font-semibold text-sm">{fullName}</div>
                  <div className="text-xs text-muted-foreground">{email}</div>
                </div>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 animate-in slide-in-from-top-2 fade-in duration-200 shadow-lg border border-border/50"
              sideOffset={8}
            >
              {/* Mobile User Info Header */}
              <div className="md:hidden flex items-center gap-3 p-4 border-b border-border/50">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={undefined} alt={firstName} />
                  <AvatarFallback className="rounded-lg bg-foreground/2 flex items-center justify-center">
                    {firstName ? (
                      firstName.substring(0, 2).toUpperCase()
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{fullName}</div>
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                </div>
              </div>

              {/* Desktop Profile Actions */}
              <div className="hidden md:block p-2">
                <DropdownMenuItem asChild>
                  <Link 
                    to="/settings/profile"
                    className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/50 p-3 rounded-md"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link 
                    to="/settings/notifications"
                    className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-muted/50 p-3 rounded-md"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Notifications</span>
                  </Link>
                </DropdownMenuItem>
              </div>

        
              <DropdownMenuSeparator />

              {/* Logout Button */}
              <div className="p-2">
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-3 cursor-pointer transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive p-3 rounded-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {isLoading ? "Logging out..." : "Log out"}
                  </span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
