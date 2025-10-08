// External Libraries
import { Outlet } from "react-router-dom";

// UI Components
import { Toaster } from "@/components/ui/sonner";


interface MainLayoutProps { }

export default function MainLayout({ }: MainLayoutProps) {
  return (
    <div className="bg-gradient-to-t from-primary/10 to-secondary/10">
      <Outlet />
      <Toaster />
    </div>
  );
}
