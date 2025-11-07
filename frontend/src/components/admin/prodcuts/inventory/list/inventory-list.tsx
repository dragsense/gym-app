// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type IInventory } from "@shared/interfaces/products/inventory.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { InventoryFilters } from "./inventory-filters";
import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { inventoryItemViews as itemViews } from "./inventory-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TInventoryListData } from "@shared/types/products/inventory.type";
import type { TInventoryViewExtraProps } from "../view/inventory-view";
import { ViewToggle } from "@/components/shared-ui/view-toggle";
import { useAuthUser } from "@/hooks/use-auth-user";
import { EUserLevels } from "@shared/enums/user.enum";

export interface IInventoryListExtraProps {
  // Add any extra props if needed
}

interface IInventoryListProps extends TListHandlerComponentProps<TListHandlerStore<IInventory, TInventoryListData, IInventoryListExtraProps>,
  TSingleHandlerStore<IInventory, TInventoryViewExtraProps>> {
}

type ViewType = "table" | "list";

export default function InventoryList({
  storeKey,
  store,
  singleStore
}: IInventoryListProps) {

  const { user } = useAuthUser()

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

  const handleView = (id: number) => {
    startTransition(() => {
      setAction('view', id);
    });
  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView,
  });

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>
      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <InventoryFilters
          store={store}
        />
        <ViewToggle componentId={componentId} />
        {user?.level <= EUserLevels.TRAINER ? <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Inventory</span>
        </Button> : null}
      </div>

      <TabsContent value="table">
        <TTable<IInventory>
          listStore={store}
          columns={columns}
          emptyMessage="No inventorys found."
          showPagination={true}
        />
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<IInventory>
            listStore={store}
            emptyMessage="No inventorys found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
