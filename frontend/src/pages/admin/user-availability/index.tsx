import { useQueryClient } from "@tanstack/react-query";

// Types
import { type IUserAvailability } from "@shared/interfaces/user-availability.interface";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { UserAvailabilityView } from "@/components/admin";
import { UserAvailabilityForm, type TUserAvailabilityExtraProps } from "@/page-components";

// API
import { deleteUserAvailability, fetchUserAvailability } from "@/services/user-availability.api";

// Layouts
import { PageInnerLayout } from "@/layouts";
import type { TUserAvailabilityViewExtraProps } from "@/components/admin/user-availability/view/user-availability-view";

export default function UserAvailabilityPage() {

  const queryClient = useQueryClient();

  const STORE_KEY = 'user-availability';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IUserAvailability, TUserAvailabilityViewExtraProps>
        queryFn={fetchUserAvailability}
        initialParams={{
          _relations: 'user',
        }}
        deleteFn={deleteUserAvailability}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={UserAvailabilityView}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: UserAvailabilityForm
          }
        ]}
        singleProps={{}}
      />

    </PageInnerLayout>
  );
}

const Header = () => null