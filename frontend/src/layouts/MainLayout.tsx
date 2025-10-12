// External Libraries
import { Outlet } from "react-router-dom";
import { useId } from "react";

// UI Components
import { Toaster } from "@/components/ui/sonner";


interface MainLayoutProps { }

export default function MainLayout({ }: MainLayoutProps) {
  // React 19: Essential IDs
  const componentId = useId();
  
  return (
    <div 
      className="bg-gradient-to-t from-primary/10 to-secondary/10"
      data-component-id={componentId}
    >
      <Outlet />
      <Toaster />
    </div>
  );
}
