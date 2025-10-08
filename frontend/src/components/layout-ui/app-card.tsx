// React types
import type { ReactNode } from "react";

// UI Components
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


interface CardProps {
  header?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void
}

export function AppCard({
  header,
  loading,
  children,
  footer,
  className,
  onClick

}: CardProps) {
  return (
    <Card className={className} onClick={onClick}>
      {header && <CardHeader>
        {header}
      </CardHeader>}
      <CardContent>
        {loading ? (
          <Skeleton />
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter>
        {footer}
      </CardFooter>}
    </Card>
  );
}
