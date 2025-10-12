import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useTransition, useId } from "react";
import { PageInnerLayout } from "@/layouts";
import { ClusterDashboard, CacheDashboard } from "@/components/admin";
import { getDetailedClusterInfo } from "@/services/cluster.api";
import { getCacheStats, clearAllCache } from "@/services/cache.api";

export default function DashboardPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const queryClient = useQueryClient();

  const { data: clusterData, isLoading, error, refetch } = useQuery({
    queryKey: ['cluster-data'],
    queryFn: getDetailedClusterInfo,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: cacheData, isLoading: cacheLoading, error: cacheError, refetch: refetchCache } = useQuery({
    queryKey: ['cache-stats'],
    queryFn: getCacheStats,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const clearCacheMutation = useMutation({
    mutationFn: clearAllCache,
    onSuccess: () => {
      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: ['cache-stats'] });
      });
    },
  });

  // React 19: Deferred values for better performance with real-time data
  const deferredClusterData = useDeferredValue(clusterData);
  const deferredCacheData = useDeferredValue(cacheData);

  return (
    <PageInnerLayout Header={<Header />}>
      <div className="space-y-8" data-component-id={componentId}>
        {/* Cluster Dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <ClusterDashboard 
            data={deferredClusterData}
            loading={isLoading}
            error={error}
            onRefresh={refetch}
          />
        </div>

        {/* Cache Dashboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Cache Performance</h2>
          <CacheDashboard 
            data={deferredCacheData}
            loading={cacheLoading}
            error={cacheError}
            onRefresh={refetchCache}
            onClearCache={() => clearCacheMutation.mutate()}
            clearingCache={clearCacheMutation.isPending}
          />
        </div>
      </div>
    </PageInnerLayout>
  );
}

const Header = () => null;
