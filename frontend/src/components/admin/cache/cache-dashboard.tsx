import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/layout-ui/app-card';
import { Database, Activity, TrendingUp, Trash2 } from 'lucide-react';
import type { ICacheResponse } from '@shared/interfaces/cache.interface';
import { useId, useMemo, useDeferredValue, useTransition } from 'react';

interface CacheDashboardProps {
  data: ICacheResponse | null | undefined;
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onClearCache: () => void;
  clearingCache: boolean;
}

export const CacheDashboard = ({
  data: cacheData,
  loading,
  error,
  onRefresh,
  onClearCache,
  clearingCache,
}: CacheDashboardProps) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  // React 19: Deferred data for better performance
  const deferredCacheData = useDeferredValue(cacheData);
  
  // React 19: Memoized loading state
  const memoizedLoadingState = useMemo(() => (
    <div className="flex items-center justify-center h-64">
      <Activity className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading cache data...</span>
    </div>
  ), []);

  // React 19: Memoized error state
  const memoizedErrorState = useMemo(() => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-4">Failed to fetch cache data</p>
      <Button onClick={onRefresh} variant="outline">
        Try Again
      </Button>
    </div>
  ), [onRefresh]);

  // React 19: Smooth cache clearing
  const handleClearCache = () => {
    startTransition(() => {
      onClearCache();
    });
  };

  if (loading && !deferredCacheData) {
    return memoizedLoadingState;
  }

  if (error) {
    return memoizedErrorState;
  }

  if (!deferredCacheData) return null;

  const { stats, hitRatio } = deferredCacheData;

  return (
    <div className="space-y-6" data-component-id={componentId}>
      {/* Cache Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AppCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.hits}</div>
            <div className="text-sm text-gray-600">Cache Hits</div>
          </div>
        </AppCard>
        <AppCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.misses}</div>
            <div className="text-sm text-gray-600">Cache Misses</div>
          </div>
        </AppCard>
        <AppCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{hitRatio.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Hit Ratio</div>
          </div>
        </AppCard>
        <AppCard>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.clears}</div>
            <div className="text-sm text-gray-600">Cache Clears</div>
          </div>
        </AppCard>
      </div>

      {/* Operations Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppCard
          header={
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Performance
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Hit Ratio</span>
              <span className="font-bold">{hitRatio.toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Hits</div>
                <div className="font-semibold">{stats.hits}</div>
              </div>
              <div>
                <div className="text-gray-600">Misses</div>
                <div className="font-semibold">{stats.misses}</div>
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard
          header={
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Operations
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.sets}</div>
                <div className="text-sm text-gray-600">Sets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.hits + stats.misses}</div>
                <div className="text-sm text-gray-600">Gets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.deletes}</div>
                <div className="text-sm text-gray-600">Deletes</div>
              </div>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Cache Actions */}
      <AppCard
        header={
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Cache Management
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Clear all cached data. This action cannot be undone.
            </p>
          </div>
          <Button 
            onClick={handleClearCache} 
            disabled={clearingCache}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {clearingCache ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </div>
      </AppCard>
    </div>
  );
};
