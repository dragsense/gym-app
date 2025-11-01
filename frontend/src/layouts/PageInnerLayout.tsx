import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useId, useDeferredValue, useMemo } from "react";
import { matchRoutePath } from "@/lib/utils";
import { ROUTE_TITLES, SEGMENTS } from "@/config/routes.config";
import { useAuthUser } from "@/hooks/use-auth-user";

interface MainLayoutProps {
  children: ReactNode;
  Header: React.ReactNode;

}

export default function PageInnerLayout({ Header, children }: MainLayoutProps) {
  // React 19: Essential IDs
  const componentId = useId();

  const location = useLocation();
  const { user } = useAuthUser();

  const title = useMemo(() => {

    const segment = SEGMENTS[user?.level ?? -1];

    const locationPath = location.pathname.replace(segment, "").replace(/^\//, "");

    if (ROUTE_TITLES[locationPath]) {
      return ROUTE_TITLES[locationPath];
    }

    for (const [pattern, title] of Object.entries(ROUTE_TITLES)) {
      if (pattern.includes(":") && matchRoutePath(pattern, locationPath)) {
        return title;
      }
    }

    return "Unknown Page";
  }, [location.pathname, user]);

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
