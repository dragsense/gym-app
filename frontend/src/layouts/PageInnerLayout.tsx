import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useId, useDeferredValue, useMemo } from "react";
import { matchRoutePath } from "@/lib/utils";
import { ROUTE_TITLES } from "@/config/routes.config";

interface MainLayoutProps {
  children: ReactNode;
  Header: React.ReactNode;

}

export default function PageInnerLayout({ Header, children }: MainLayoutProps) {
  // React 19: Essential IDs
  const componentId = useId();
  
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
    <div className="flex flex-col gap-2" data-component-id={componentId}>
      <div className="flex justify-between flex-wrap py-2">
        <h1 className="text-lg md:text-2xl font-semibold">{deferredTitle}</h1>
        {Header}
      </div>
      <div className="max-h-[calc(100vh-210px)] overflow-auto pr-2">
        {children}
      </div>
    </div>
  );
}
