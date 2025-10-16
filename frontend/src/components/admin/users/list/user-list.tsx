// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type IUser } from "@shared/interfaces/user.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { UserFilters } from "./user-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { userItemViews as itemViews } from "./user-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";


// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TUserListData } from "@shared/types";
import type { TUserViewExtraProps } from "../view/user-view";



export interface IUserListExtraProps {
  level: number;
}


interface IUserListProps extends TListHandlerComponentProps<TListHandlerStore<IUser, TUserListData, IUserListExtraProps>,
  TSingleHandlerStore<IUser, TUserViewExtraProps>> {
}

export type ViewType = "table" | "list";


export default function UserList({
  storeKey,
  store,
  singleStore
}: IUserListProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return (`List store "${storeKey}" not found. Did you forget to register it?`);
  }

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const setAction = singleStore(state => state.setAction);

  const [currentView, setCurrentView] = useState<ViewType>("table");

  // React 19: Smooth action transitions
  const handleCreate = () => {
    startTransition(() => {
      setAction('createOrUpdate');
    });
  };

  const handleEdit = (id: number) => {
    startTransition(() => {
      setAction('createOrUpdate', id);
    });
  }

  const handleUpdateProfile = (id: number) => {
    startTransition(() => {
      setAction('updateProfile', id);
    });
  }

  const handleDelete = (id: number) => {
    startTransition(() => {
      setAction('delete', id);
    });
  }

  const handleView = (trainerId: number) => {
    startTransition(() => {
      setAction('view', trainerId);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView,
    handleUpdateProfile
  }
  );



  // React 19: Memoized view toggle for better performance
  const renderViewToggle = useMemo(() => (
    <TabsList className="flex justify-center items-center w-auto border-gray-200" data-component-id={componentId}>
      <TabsTrigger
        value="table"
        className="flex items-center gap-2 px-4 data-[state=active]:text-secondary data-[state=active]:font-semibold"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </TabsTrigger>

      <TabsTrigger
        value="list"
        className="flex items-center gap-2 px-4 data-[state=active]:text-secondary data-[state=active]:font-semibold"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </TabsTrigger>
    </TabsList>
  ), [componentId]);

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>


      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <UserFilters
          store={store}
        />
        {renderViewToggle}
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add User</span>
        </Button>
      </div>




      <TabsContent value="table">
        <AppCard className="px-0">
          <TTable<IUser>
            listStore={store}
            columns={columns}
            emptyMessage="No users found."
            showPagination={true}
          /></AppCard>
      </TabsContent>


      <TabsContent value="list">
        <div>
          <TList<IUser>
            listStore={store}
            emptyMessage="No users found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>


    </Tabs>
  );
}