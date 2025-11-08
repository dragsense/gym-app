// External Libraries

// Types
import type { ICombinedDashboardData } from "@shared/interfaces/dashboard.interface";
import { EAnalyticsPeriod } from "@shared/enums/dashboard-analytics.enum";

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { DashboardControls, DashboardView, type IExtraProps } from "@/components/admin";

// Layouts
import { PageInnerLayout } from "@/layouts";

// API
import { fetchCombinedDashboardData } from "@/services/dashboard.api";

// Stores
import type { TSingleHandlerStore } from "@/stores";

export default function DashboardPage() {
  return (
    <SingleHandler<ICombinedDashboardData, IExtraProps>
      queryFn={(_id, queryParams) => {
        const params: Record<string, string | undefined> = {};

        if (queryParams?.period) {
          params.period = queryParams.period as string;
        }

        const customRange = queryParams?.customRange as { from?: Date; to?: Date } | undefined;
        if (customRange?.from) {
          params.from = customRange.from.toISOString().split("T")[0];
        }

        if (customRange?.to) {
          params.to = customRange.to.toISOString().split("T")[0];
        }

        return fetchCombinedDashboardData(params);
      }}
      storeKey="dashboardOverview"
      enabled={true}
      SingleComponent={({ storeKey, store }) => {
        if (!store) {
          return <div>Dashboard store "{storeKey}" not found. Did you forget to register it?</div>;
        }
        return (
          <PageInnerLayout
            Header={
              <Header
                store={store}
              />
            }
          >
            <DashboardView storeKey={storeKey} store={store} />
          </PageInnerLayout>
        );
      }}
      singleProps={{
        period: EAnalyticsPeriod.MONTH,
        customRange: undefined
      }}
      initialParams={{
        period: EAnalyticsPeriod.MONTH,
        customRange: undefined
      }}
    />
  );
}

interface HeaderProps {
  store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>;
}

const Header = ({
  store
}: HeaderProps) => (
  <DashboardControls store={store} />
);
