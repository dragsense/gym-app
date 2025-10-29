
import { useQueryClient } from "@tanstack/react-query";

// Types
import { type IUser } from "@shared/interfaces/user.interface";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { UserList, UserView } from "@/components/admin";
import { ProfileForm, UserForm, type TUserExtraProps } from "@/page-components";


// API
import { deleteUser, fetchUser, fetchUsers } from "@/services/user.api";

// Types
import { EUserLevels } from "@shared/enums/user.enum";


// Layouts
import { PageInnerLayout } from "@/layouts";
import { UserListDto } from "@shared/dtos";
import type { TUserViewExtraProps } from "@/components/admin/users/view/user-view";
import type { TUserListData } from "@shared/types";


export default function UsersPage() {

  const queryClient = useQueryClient();

  const STORE_KEY = 'user';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IUser, TUserViewExtraProps>
        queryFn={fetchUser}
        initialParams={{
          _relations: 'profile',
        }}
        deleteFn={deleteUser}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={UserView}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: UserForm
          },
          {
            action: 'updateProfile',
            comp: ProfileForm
          }
        ]}
        singleProps={{
          level: EUserLevels.USER,
        }}
      />

      <ListHandler<IUser, TUserListData, TUserExtraProps, IUser, TUserViewExtraProps>
        queryFn={(params) => fetchUsers(params)}
        ListComponent={UserList}
        dto={UserListDto}
        initialParams={{
          _relations: 'profile',
          _select: 'email, level, isActive, profile.firstName,profile.lastName,profile.phoneNumber, createdAt',
          sortBy: 'createdAt',
          sortOrder: 'ASC',
        }}
        storeKey={STORE_KEY}
        listProps={{
          level: EUserLevels.USER,
        }}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
