import { useId } from "react";
import { PageInnerLayout } from "@/layouts";
import { HealthDashboard } from "@/components/admin";
import { SingleHandler } from "@/handlers";
import { getHealthStatus } from "@/services/health.api";
import type { IHealthStatus } from "@shared/interfaces/health.interface";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function SystemDashboardPage() {
  const componentId = useId();

  const queryClient = useQueryClient();

  const STORE_KEY = "health-dashboard";

  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-single"] });
  };

  const refetchHealth = () => {
    queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-single"] });
  }

  return (
    <PageInnerLayout Header={<Header handleRefreshAll={handleRefreshAll} />}>
      <div className="space-y-8" data-component-id={componentId}>
        <SingleHandler<IHealthStatus>
          queryFn={getHealthStatus}
          SingleComponent={HealthDashboard}
          singleProps={{
            refetch: refetchHealth,
          }}
          storeKey={STORE_KEY}
          enabled={true}
        />
      </div>
    </PageInnerLayout>
  );
}

const Header = ({ handleRefreshAll }: { handleRefreshAll: () => void }) => {
  return (
    <Button
      onClick={handleRefreshAll}
    >
      Refresh All
    </Button>
  );
};
