import { useId } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, DollarSign, User, Edit, Trash2, Eye } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { type IInventory } from "@shared/interfaces/products/inventory.interface";
import type { ColumnDef } from "@tanstack/react-table";

interface IInventoryItemViewsProps {
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleView: (id: string) => void;
}

export function inventoryItemViews({ handleEdit, handleDelete, handleView }: IInventoryItemViewsProps) {
  const componentId = useId();

  // Table columns
  const columns: ColumnDef<IInventory>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.description}</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{row.original.type}</Badge>
        </div>
      ),
    },
    {
      id: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => <span>{row.original.quantity}</span>,
    },
    {
      id: 'unit',
      header: 'Unit',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.unit}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original.id)}
            data-component-id={componentId}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
            data-component-id={componentId}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            data-component-id={componentId}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // List item renderer
  const listItem = (inventory: IInventory) => (
    <AppCard className="p-4 hover:shadow-md transition-shadow" data-component-id={componentId}>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{inventory.name}</h3>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline">{inventory.description}</Badge>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{inventory.type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>Quantity:</strong> {inventory.quantity}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>Unit:</strong> {inventory.unit}</span>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(inventory.id)}
            data-component-id={componentId}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(inventory.id)}
            data-component-id={componentId}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(inventory.id)}
            data-component-id={componentId}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppCard>
  );

  return { columns, listItem };
}
