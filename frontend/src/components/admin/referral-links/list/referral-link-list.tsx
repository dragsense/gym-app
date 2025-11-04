// React & Hooks
import { useEffect, useState, useId, useMemo, useTransition } from "react";

// External libraries
import { List, Plus, Table } from "lucide-react";

// Types
import { type IReferralLink } from "@shared/interfaces/referral-link.interface";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";

import { AppCard } from "@/components/layout-ui/app-card";

// Local
import { ReferralLinkFilters } from "./referral-link-filters";
import { referralLinkItemViews as itemViews } from "./referral-link-item-views";

// Stores
import { type TListHandlerStore, type TSingleHandlerStore } from "@/stores";

// Config
import { type TListHandlerComponentProps } from "@/@types/handler-types";
import type { TReferralLinkListData } from "@shared/types/referral-link.type";
import { ViewToggle } from "@/components/shared-ui/view-toggle";

export interface IReferralListExtraProps {
  // Add any extra props if needed
}

interface IReferralListProps extends TListHandlerComponentProps<TListHandlerStore<IReferralLink, TReferralLinkListData, IReferralListExtraProps>,
  TSingleHandlerStore<IReferralLink, any>> {
}

type ViewType = "table" | "list";

export default function ReferralList({
  storeKey,
  store,
  singleStore
}: IReferralListProps) {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
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

  const handleView = (id: string) => {

  }

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView,
  });



  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} data-component-id={componentId}>
      <div className="flex flex-1 justify-between items-start md:items-center gap-2 flex-wrap">
        <ReferralLinkFilters
          store={store}
        />
        <ViewToggle componentId={componentId} />
        <Button
          onClick={handleCreate}
          data-component-id={componentId}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Referral Link</span>
        </Button>
      </div>

      <TabsContent value="table">
        <TTable<IReferralLink>
          listStore={store}
          columns={columns}
          emptyMessage="No referral links found."
          showPagination={true}
        />
      </TabsContent>

      <TabsContent value="list">
        <div>
          <TList<IReferralLink>
            listStore={store}
            emptyMessage="No referral links found."
            showPagination={true}
            renderItem={listItem}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
