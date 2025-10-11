import { useQueryClient } from "@tanstack/react-query";

// Types
import { type IQueue } from "@shared/interfaces/queue.interface";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { QueueList } from "@/components/admin";

// API
import { fetchQueues } from "@/services/queue.api";
import type { TQueueListData } from "@shared/types";

// Layouts
import { PageInnerLayout } from "@/layouts";
import { QueueListDto } from "@shared/dtos/queue-dtos/queue.dto";

// Components
import { CleanQueue, PauseQueue, QueueJobList, ResumeQueue } from "@/page-components";

export default function QueueManagementPage() {

  const QUEUE_STORE_KEY = 'queue';

  return (
    <PageInnerLayout Header={<Header />}>
      <ListHandler<IQueue, TQueueListData>
        queryFn={fetchQueues}
        ListComponent={QueueList}
        dto={QueueListDto}
        storeKey={QUEUE_STORE_KEY}
        actionComponents={[
          {
            action: "viewJobs",
            comp: QueueJobList,
          },
          {
            action: "pauseQueue",
            comp: PauseQueue,
          },
          {
            action: "resumeQueue",
            comp: ResumeQueue,
          },
          {
            action: 'cleanQueue',
            comp: CleanQueue,
          }
        ]}
      />
    </PageInnerLayout>
  );
}

const Header = () => null;
