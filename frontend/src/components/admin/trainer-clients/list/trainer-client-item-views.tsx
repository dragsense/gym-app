// External Libraries
import { type JSX, useId, useMemo, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, Users } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
import type { ITrainerClient } from "@shared/interfaces/trainer-client.interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AppCard } from "@/components/layout-ui/app-card";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";

const TrainerClientActions = ({
  trainerClient,
  handleEdit,
  handleDelete,
  handleView,
  handleUpdateProfile,
}: {
  trainerClient: ITrainerClient;
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
  handleUpdateProfile?: (id: number) => void;
}) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const handleViewClick = () => {
    if (handleView) {
      startTransition(() => handleView(trainerClient.id));
    }
  };

  const handleUpdateProfileClick = () => {
    if (handleUpdateProfile) {
      startTransition(() => handleUpdateProfile(trainerClient.id));
    }
  };

  const handleEditClick = () => {
    if (handleEdit) {
      startTransition(() => handleEdit(trainerClient.id));
    }
  };

  const handleDeleteClick = () => {
    if (handleDelete) {
      startTransition(() => handleDelete(trainerClient.id));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" data-component-id={componentId}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {handleView && (
          <DropdownMenuItem onClick={handleViewClick}>
            View Details
          </DropdownMenuItem>
        )}
        {handleUpdateProfile && (
          <DropdownMenuItem onClick={handleUpdateProfileClick}>
            Update Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {handleEdit && (
          <DropdownMenuItem onClick={handleEditClick}>
            Edit
          </DropdownMenuItem>
        )}
        {handleDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={handleDeleteClick}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const trainerClientItemViews = ({
  handleEdit,
  handleDelete,
  handleView,
  handleUpdateProfile
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
  handleUpdateProfile?: (id: number) => void;
}): {
  columns: ColumnDef<ITrainerClient>[];
  listItem: (item: ITrainerClient) => JSX.Element;
} => {
  const columns: ColumnDef<ITrainerClient>[] = [
    {
      accessorKey: "trainer.user.email",
      header: "Trainer",
     
    },
    {
      accessorKey: "client.user.email",
      header: "Client",
     
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge variant={status === 'active' ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const trainerClient = row.original;

        return (
          <TrainerClientActions
          trainerClient={trainerClient}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleView={handleView}
            handleUpdateProfile={handleUpdateProfile}
          />
        );
      },
    },
  ];

  const listItem = (item: ITrainerClient) => {
    // React 19: Essential IDs
    const componentId = useId();
    
    const trainer = item.trainer?.user;
    const client = item.client?.user;

    return (
      <AppCard data-component-id={componentId}>
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Trainer:</span> <span className="font-semibold">{trainer?.email || 'N/A'}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Client:</span> <span className="font-semibold">{client?.email || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant={item.status === 'Active' ? "default" : "secondary"}>
                  {item.status}
                </Badge>
              </div>
            </div>
            
            {/* Notes */}
            {item.notes && (
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 self-start">
            <TrainerClientActions
              trainerClient={item}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleView={handleView}
              handleUpdateProfile={handleUpdateProfile}
            />
          </div>
        </div>
      </AppCard>
    );
  };

  return { columns, listItem };
};
