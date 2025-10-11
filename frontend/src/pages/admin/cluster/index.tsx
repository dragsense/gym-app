import { useQuery } from "@tanstack/react-query";
import { PageInnerLayout } from "@/layouts";
import { ClusterDashboard } from "@/components/admin";
import { getDetailedClusterInfo } from "@/services/cluster.api";

export default function ClusterPage() {
  const { data: clusterData, isLoading, error, refetch } = useQuery({
    queryKey: ['cluster-data'],
    queryFn: getDetailedClusterInfo,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <PageInnerLayout Header={<Header />}>
      <ClusterDashboard 
        data={clusterData}
        loading={isLoading}
        error={error}
        onRefresh={refetch}
      />
    </PageInnerLayout>
  );
}

const Header = () => null;
