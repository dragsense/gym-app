// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type ITrainerClient } from "@shared/interfaces/trainer-client.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { TrainerClientFilters } from "./trainer-client-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { trainerClientItemViews as itemViews } from "./trainer-client-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TTrainerClientListData } from "@shared/types/trainer-client.type";
import type { TTrainerClientViewExtraProps } from "../view/trainer-client-view";
import { ViewToggle } from "@/components/shared-ui/view-toggle";



interface ITrainerClientListProps extends TListHandlerComponentProps<TListHandlerStore<ITrainerClient, TTrainerClientListData, any>,
  TSingleHandlerStore<ITrainerClient, TTrainerClientViewExtraProps>> {
}

type ViewType = "table" | "list";

export default function TrainerClientList({
  storeKey,
  store,
  singleStore
}: ITrainerClientListProps) {
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

  const handleView = (trainerClientId: number) => {
    startTransition(() => {
      setAction('view', trainerClientId);
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
        <TrainerClientFilters
          store={store}
        />
        <ViewToggle componentId={componentId} />
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Trainer-Client</span>
        </Button>
      </div>

      <TabsContent value="table">
        <AppCard className="px-0">
          <TTable<ITrainerClient>
            listStore={store}
            columns={columns}
            emptyMessage="No trainer-clients found."
            showPagination={true}
          /></AppCard>
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<ITrainerClient>
            listStore={store}
            emptyMessage="No trainer-clients found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
