// React & Hooks
import { useState, useId, useMemo, useTransition } from "react";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type IFileUpload } from "@shared/interfaces/file-upload.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { itemViews } from "./file-item-views";
import { FileFilters } from "./file-filters";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";

export interface IFileListExtraProps {}

interface IFileListProps extends TListHandlerComponentProps<TListHandlerStore<IFileUpload, any, IFileListExtraProps>,
  TSingleHandlerStore<IFileUpload, any>> {
}

export type ViewType = "table" | "list";

export default function FileList({
  storeKey,
  store,
  singleStore
}: IFileListProps) {
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

  const handleDelete = (id: number) => {
    startTransition(() => {
      setAction('delete', id);
    });
  }

  const handleView = (id: number) => {
    startTransition(() => {
      setAction('view', id);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView
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
        <FileFilters store={store} />
        {renderViewToggle}
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            variant="default"
            data-component-id={componentId}
          >
            <Plus /> <span className="hidden sm:inline">Create</span>
          </Button>
      
        </div>
      </div>

      <TabsContent value="table">
        <AppCard className="px-0">
          <TTable<IFileUpload>
            listStore={store}
            columns={columns}
            emptyMessage="No files found."
            showPagination={true}
          /></AppCard>
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<IFileUpload>
            listStore={store}
            emptyMessage="No files found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>

    </Tabs>
  );
}

