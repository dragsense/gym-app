// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type IClient } from "@shared/interfaces/client.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

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
        <ClientFilters
          store={store}
        />
        {renderViewToggle}
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
