// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { Plus } from "lucide-react";

// Types
import { type IClient } from "@shared/interfaces/client.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";
import { ViewToggle } from "@/components/shared-ui/view-toggle";

import { ClientFilters } from "./client-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { clientItemViews as itemViews } from "./client-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TClientListData } from "@shared/types/client.type";
import type { TClientViewExtraProps } from "../view/client-view";

export interface IClientListExtraProps {
  level: number;
}

interface IClientListProps extends TListHandlerComponentProps<TListHandlerStore<IClient, TClientListData, IClientListExtraProps>,
  TSingleHandlerStore<IClient, TClientViewExtraProps>> {
}

type ViewType = "table" | "list";

export default function ClientList({
  storeKey,
  store,
  singleStore
}: IClientListProps) {
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

  const handleEdit = (id: string) => {
    startTransition(() => {
      setAction('createOrUpdate', id);
    });
  }

  const handleUpdateProfile = (id: string) => {
    startTransition(() => {
      setAction('updateProfile', id);
    });
  }

  const handleDelete = (id: string) => {
    startTransition(() => {
      setAction('delete', id);
    });
  }

  const handleView = (clientId: number) => {
    startTransition(() => {
      setAction('view', clientId);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView,
    handleUpdateProfile
  });

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>
      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <ClientFilters store={store} />
        <ViewToggle componentId={componentId} className="border-gray-200" />
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Client</span>
        </Button>
      </div>

      <TabsContent value="table">
        <AppCard className="px-0">
          <TTable<IClient>
            listStore={store}
            columns={columns}
            emptyMessage="No clients found."
            showPagination={true}
          /></AppCard>
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<IClient>
            listStore={store}
            emptyMessage="No clients found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
