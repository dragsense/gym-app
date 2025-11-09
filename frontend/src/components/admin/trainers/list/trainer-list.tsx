// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { Plus } from "lucide-react";

// Types
import { type ITrainer } from "@shared/interfaces/trainer.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";
import { ViewToggle } from "@/components/shared-ui/view-toggle";

import { TrainerFilters } from "./trainer-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { trainerItemViews as itemViews } from "./trainer-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TTrainerListData } from "@shared/types/trainer.type";
import type { TTrainerViewExtraProps } from "../view/trainer-view";

export interface ITrainerListExtraProps {
  level: number;
}

interface ITrainerListProps extends TListHandlerComponentProps<TListHandlerStore<ITrainer, TTrainerListData, ITrainerListExtraProps>,
  TSingleHandlerStore<ITrainer, TTrainerViewExtraProps>> {
}

type ViewType = "table" | "list";

export default function TrainerList({
  storeKey,
  store,
  singleStore
}: ITrainerListProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  const { t } = useI18n();

  if (!store) {
    return (`${buildSentence(t, 'list', 'store')} "${storeKey}" ${buildSentence(t, 'not', 'found')}. ${buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?`);
  }

  if (!singleStore) {
    return `${buildSentence(t, 'single', 'store')} "${singleStore}" ${buildSentence(t, 'not', 'found')}. ${buildSentence(t, 'did', 'you', 'forget', 'to', 'register', 'it')}?`;
  }

  const setListAction = store(state => state.setAction);
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
      setListAction('updateProfile', id);
    });
  }

  const handleDelete = (id: string) => {
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
  });

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>
      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <TrainerFilters store={store} />
        <ViewToggle componentId={componentId} />
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">{buildSentence(t, 'add', 'trainer')}</span>
        </Button>
      </div>

      <TabsContent value="table">
        <TTable<ITrainer>
          listStore={store}
          columns={columns}
          emptyMessage={buildSentence(t, 'no', 'trainers', 'found')}
          showPagination={true}
        />
      </TabsContent>

      <TabsContent value="list">
        <TList<ITrainer>
          listStore={store}
          emptyMessage={buildSentence(t, 'no', 'trainers', 'found')}
          showPagination={true}
          renderItem={listItem}
        />
      </TabsContent>
    </Tabs>
  );
}
