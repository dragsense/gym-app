import { useQueryClient } from "@tanstack/react-query";
import { useId, useTransition } from "react";

// Types
import { type IUserAvailability } from "@shared/interfaces/user-availability.interface";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { UserAvailabilityView } from "@/components/admin";

// Page Components
import { UserAvailabilityForm, type TUserAvailabilityExtraProps } from "@/page-components";

// API
import { deleteUserAvailability, fetchUserAvailability } from "@/services/user-availability.api";

// Layouts
import { PageInnerLayout } from "@/layouts";

export default function UserAvailabilityPage() {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const queryClient = useQueryClient();

  const STORE_KEY = "user-availability";

  return (
    <PageInnerLayout Header={<Header />}>
      <div data-component-id={componentId}>
        <SingleHandler<IUserAvailability, TUserAvailabilityExtraProps>
          queryFn={fetchUserAvailability}
          deleteFn={deleteUserAvailability}
          storeKey={STORE_KEY}
          enabled={true}
          onDeleteSuccess={() => {
            startTransition(() => {
              queryClient.invalidateQueries({ queryKey: [STORE_KEY] });
            });
          }}
          SingleComponent={UserAvailabilityView}
          actionComponents={[
            {
              action: "createOrUpdate",
              comp: UserAvailabilityForm,
            },
          ]}
        />
      </div>
    </PageInnerLayout>
  );
}

const Header = () => null;