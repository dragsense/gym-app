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
      accessorKey: "trainer.profile.image",
      header: "Trainer",
      cell: ({ row }) => {
        const trainer = row.original.trainer;
        const profile = trainer?.profile;
        const name = profile ? `${profile.firstName} ${profile.lastName}` : '-';
        const imagePath = profile?.image?.url;
        return (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            {imagePath ? (
              <img
                src={encodeURI(`${API_URL}/${imagePath}`)}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              name.charAt(0)
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "client.profile",
      header: "Client",
      cell: ({ row }) => {
        const client = row.original.client;
        const profile = client?.profile;
        return profile ? `${profile.firstName} ${profile.lastName}` : '-';
      },
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
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => {
        const startDate = row.getValue<string>("startDate");
        return startDate ? new Date(startDate).toLocaleDateString() : '-';
      },
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => {
        const endDate = row.getValue<string>("endDate");
        return endDate ? new Date(endDate).toLocaleDateString() : '-';
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
    
    const trainer = item.trainer;
    const client = item.client;
    const trainerName = trainer?.profile ? `${trainer.profile.firstName} ${trainer.profile.lastName}` : 'Unknown Trainer';
    const clientName = client?.profile ? `${client.profile.firstName} ${client.profile.lastName}` : 'Unknown Client';
    const trainerImagePath = trainer?.profile?.image?.url;
    const clientImagePath = client?.profile?.image?.url;

    // React 19: Memoized badge class for better performance
    const badgeClass = useMemo(() => 
      item.status === 'active'
        ? 'bg-green-100 text-green-800 border-green-200 border text-xs' 
        : 'bg-gray-100 text-gray-800 border-gray-200 border text-xs',
      [item.status]
    );

    return (
      <AppCard data-component-id={componentId}>
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                  {trainerName} - {clientName}
                </h3>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge className={badgeClass}>
                  {item.status}
                </Badge>
              </div>
            </div>

            {/* Trainer and Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trainer Info */}
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {trainerImagePath ? (
                    <img
                      src={encodeURI(`${API_URL}/${trainerImagePath}`)}
                      alt={trainerName}
                      className="w-8 h-8 rounded object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    trainerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-blue-900">{trainerName}</div>
                  <div className="text-xs text-blue-600">{trainer?.email}</div>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <div className="w-8 h-8 rounded bg-green-200 flex items-center justify-center text-green-600 font-bold text-sm flex-shrink-0">
                  {clientImagePath ? (
                    <img
                      src={encodeURI(`${API_URL}/${clientImagePath}`)}
                      alt={clientName}
                      className="w-8 h-8 rounded object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    clientName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-green-900">{clientName}</div>
                  <div className="text-xs text-green-600">{client?.email}</div>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Start:</span>
                <span className="font-medium">{item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>End:</span>
                <span className="font-medium">{item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Ongoing'}</span>
              </div>
            </div>
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
