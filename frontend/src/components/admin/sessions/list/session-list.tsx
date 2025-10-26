// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type ISession } from "@shared/interfaces/session.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { SessionFilters } from "./session-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { sessionItemViews as itemViews } from "./session-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TSessionListData } from "@shared/types/session.type";
import type { TSessionViewExtraProps } from "../view/session-view";

export interface ISessionListExtraProps {
  // Add any extra props if needed
}

interface ISessionListProps extends TListHandlerComponentProps<TListHandlerStore<ISession, TSessionListData, ISessionListExtraProps>,
  TSingleHandlerStore<ISession, TSessionViewExtraProps>> {
}

type ViewType = "table" | "list";

export default function SessionList({
  storeKey,
  store,
  singleStore
}: ISessionListProps) {
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

  const handleDelete = (id: string) => {
    startTransition(() => {
      setAction('delete', id);
    });
  }

  const handleView = (sessionId: number) => {
    startTransition(() => {
      setAction('view', sessionId);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView,
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
        <SessionFilters
          store={store}
        />
        {renderViewToggle}
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Session</span>
        </Button>
      </div>

      <TabsContent value="table">
        <TTable<ISession>
          listStore={store}
          columns={columns}
          emptyMessage="No sessions found."
          showPagination={true}
        />
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<ISession>
            listStore={store}
            emptyMessage="No sessions found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
