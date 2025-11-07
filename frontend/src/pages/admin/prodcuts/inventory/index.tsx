
import { useQueryClient } from "@tanstack/react-query";

// Types
import { type IInventory } from "@shared/interfaces/products/inventory.interface";

// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { InventoryList, InventoryView } from "@/components/admin";
import { InventoryForm } from "@/page-components";


// API
import { deleteInventory, fetchInventories, fetchInventory } from "@/services/products/inventory.api";

// Types
import type { TInventoryListData } from "@shared/types";

// Layouts
import { PageInnerLayout } from "@/layouts";

// Dtos
import { InventoryListDto } from "@shared/dtos";


export default function InventorysPage() {

    const queryClient = useQueryClient();

    const STORE_KEY = 'inventory';

    return (
        <PageInnerLayout Header={<Header />}>

            <SingleHandler<IInventory>
                queryFn={fetchInventory}
                deleteFn={deleteInventory}
                onDeleteSuccess={() => queryClient.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
                storeKey={STORE_KEY}
                SingleComponent={InventoryView}
                actionComponents={
                    [
                        {
                            action: "createOrUpdate",
                            comp: InventoryForm,
                        },
                    ]
                }
            />

            <ListHandler<IInventory, TInventoryListData>
                queryFn={(params) => fetchInventories(params)}
                ListComponent={InventoryList}
                dto={InventoryListDto}
                storeKey={STORE_KEY}
            />
        </PageInnerLayout>
    );
}



const Header = () => null
