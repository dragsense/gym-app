import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useTransition, useId } from "react";
import { PageInnerLayout } from "@/layouts";
import { ClusterDashboard, CacheDashboard, HealthDashboard } from "@/components/admin";
import { getDetailedClusterInfo } from "@/services/cluster.api";
import { getCacheStats, clearAllCache } from "@/services/cache.api";
import { getDetailedHealth } from "@/services/health.api";

export default function DashboardPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [isPending, startTransition] = useTransition();
  
  const queryClient = useQueryClient();
  
  // React Query: Use useQueries for multiple parallel queries
  const queries = useQueries({
    queries: [
      {
        queryKey: ['cluster-data'],
        queryFn: getDetailedClusterInfo,
        refetchInterval: 5000,
      },
      {
        queryKey: ['cache-stats'],
        queryFn: getCacheStats,
        refetchInterval: 5000,
      },
      {
        queryKey: ['health-detailed'],
        queryFn: getDetailedHealth,
        refetchInterval: 10000,
      },
    ],
  });

  // Extract individual query results
  const [clusterQuery, cacheQuery, healthQuery] = queries;
  
  // Combined loading and error states
  const isLoading = queries.some(query => query.isLoading);
  const hasError = queries.some(query => query.error);
  const isFetching = queries.some(query => query.isFetching);

  // React 19: Enhanced refresh handler using React Query with transitions
  const handleRefreshAll = () => {
    startTransition(() => {
      // Refetch all queries in parallel
      queries.forEach(query => query.refetch());
    });
  };

  // React 19: Transition-wrapped data access
  const getTransitionData = (query: any) => {
    if (isPending) {
      return { data: null, loading: true, error: null };
    }
    return {
      data: query.data,
      loading: query.isLoading,
      error: query.error,
    };
  };

  const clearCacheMutation = useMutation({
    mutationFn: clearAllCache,
    onSuccess: () => {
      startTransition(() => {
        // Invalidate specific queries
        queryClient.invalidateQueries({ queryKey: ['cache-stats'] });
      });
    },
  });

  // React 19: Transition-wrapped data with deferred values
  const clusterData = getTransitionData(clusterQuery);
  const cacheData = getTransitionData(cacheQuery);
  const healthData = getTransitionData(healthQuery);
  
  const deferredClusterData = useDeferredValue(clusterData.data);
  const deferredCacheData = useDeferredValue(cacheData.data);
  const deferredHealthData = useDeferredValue(healthData.data);

  return (
    <PageInnerLayout Header={<Header />}>
      <div className="space-y-8" data-component-id={componentId}>
        {/* Global Dashboard Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Dashboard</h1>
            <p className="text-sm text-gray-600">
              Real-time monitoring of system performance and health
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {(isPending || isFetching) && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Updating...
              </div>
            )}
            <button
              onClick={handleRefreshAll}
              disabled={isPending || isFetching}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Refresh All
            </button>
          </div>
        </div>

        {/* Cluster Dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <ClusterDashboard 
            data={deferredClusterData}
            loading={clusterData.loading}
            error={clusterData.error}
            onRefresh={() => startTransition(() => clusterQuery.refetch())}
          />
        </div>

        {/* Cache Dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cache Performance</h2>
          <CacheDashboard 
            data={deferredCacheData}
            loading={cacheData.loading}
            error={cacheData.error}
            onRefresh={() => startTransition(() => cacheQuery.refetch())}
            onClearCache={() => clearCacheMutation.mutate()}
            clearingCache={clearCacheMutation.isPending}
          />
        </div>

        {/* Health Dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <HealthDashboard 
            data={deferredHealthData}
            loading={healthData.loading}
            error={healthData.error}
            onRefresh={() => startTransition(() => healthQuery.refetch())}
          />
        </div>
      </div>
    </PageInnerLayout>
  );
}

const Header = () => null;
