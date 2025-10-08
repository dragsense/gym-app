import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { matchRoutePath } from "@/lib/utils";
import { ROUTE_TITLES } from "@/config/routes.config";

interface MainLayoutProps {
  children: ReactNode;
  Header: React.ReactNode;

}

export default function PageInnerLayout({ Header, children }: MainLayoutProps) {

  const location = useLocation();


  const getRouteTitle = () => {
    if (ROUTE_TITLES[location.pathname]) {
      return ROUTE_TITLES[location.pathname];
    }

    for (const [pattern, title] of Object.entries(ROUTE_TITLES)) {
      if (pattern.includes(":") && matchRoutePath(pattern, location.pathname)) {
        return title;
      }
    }

    return "Unknown Page";
  };

  const title = getRouteTitle();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between flex-wrap py-2">
        <h1 className="text-lg md:text-2xl font-semibold">{title}</h1>
        {Header}
      </div>
      <div className="max-h-[calc(100vh-210px)] overflow-auto pr-2">
        {children}
      </div>

    </div>
  );
}
