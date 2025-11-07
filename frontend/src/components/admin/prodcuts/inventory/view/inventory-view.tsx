// External Libraries
import { useShallow } from 'zustand/shallow';
import { useId, useMemo, useTransition } from 'react';
import { format } from 'date-fns';

// Components
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Calendar, Clock, MapPin, DollarSign, User, Target, FileText, Mail } from "lucide-react";

// Types
import { type IInventory } from "@shared/interfaces/products/inventory.interface";

// Stores
import { type TSingleHandlerStore } from "@/stores";
import { type THandlerComponentProps } from "@/@types/handler-types";

export type TInventoryViewExtraProps = {
    // Add any extra props if needed
}

interface IInventoryViewProps extends THandlerComponentProps<TSingleHandlerStore<IInventory, TInventoryViewExtraProps>> {
}

export default function InventoryView({ storeKey, store }: IInventoryViewProps) {
    // React 19: Essential IDs and transitions
    const componentId = useId();
    const [, startTransition] = useTransition();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: inventory, action, reset } = store(useShallow(state => ({
        response: state.response,
        action: state.action,
        reset: state.reset,
    })));

    if (!inventory) {
        return null;
    }


    const handleCloseView = () => {
        startTransition(() => reset());
    };




    return (
        <Dialog open={action === 'view'} onOpenChange={handleCloseView} data-component-id={componentId}>
            <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
                <AppDialog
                    title="Inventory Details"
                    description="View detailed information about this inventory"
                >
                    <InventoryDetailContent inventory={inventory} />
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}

interface IInventoryDetailContentProps {
    inventory: IInventory;
}

function InventoryDetailContent({ inventory }: IInventoryDetailContentProps) {
    // React 19: Essential IDs
    const componentId = useId();



    return (
        <div className="space-y-6" data-component-id={componentId}>
            {/* Quick Preview Card */}
            <AppCard className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {inventory.name}
                        </h2>
                        <p className="text-blue-600 font-medium">{inventory.description}</p>
                    </div>
                </div>
            </AppCard>

            <div className="space-y-6">
                {/* Inventory Information */}
                <AppCard
                    header={
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            <div>
                                <span className="font-semibold">Inventory Information</span>
                                <p className="text-sm text-muted-foreground">Details about inventory</p>
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Unit:</span>
                                <p className="font-medium">{inventory.unit}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Quantity:</span>
                                <p className="font-medium">{inventory.quantity}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-muted-foreground"><Clock className="w-4 h-4" /></div>
                            <div className="flex-1">
                                <span className="text-sm text-muted-foreground">Type:</span>
                                <p className="font-medium">{inventory.type}</p>
                            </div>
                        </div>
                    </div>
                </AppCard>
            </div>
        </div>
    );
}
