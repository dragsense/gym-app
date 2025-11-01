// External Libraries
import { type JSX, useId, useMemo, useTransition } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, User } from "lucide-react";

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
import type { ITrainer } from "@shared/interfaces/trainer.interface";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";

const TrainerActions = ({
  trainer,
  handleEdit,
  handleDelete,
  handleView,
  handleUpdateProfile,
}: {
  trainer: ITrainer;
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
  handleView?: (id: string) => void;
  handleUpdateProfile?: (id: string) => void;
}) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();

  const handleViewClick = () => {
    if (handleView) {
      startTransition(() => handleView(trainer.id));
    }
  };

  const handleUpdateProfileClick = () => {
    if (handleUpdateProfile) {
      startTransition(() => handleUpdateProfile(trainer.id));
    }
  };

  const handleEditClick = () => {
    if (handleEdit) {
      startTransition(() => handleEdit(trainer.id));
    }
  };

  const handleDeleteClick = () => {
    if (handleDelete) {
      startTransition(() => handleDelete(trainer.id));
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

export const trainerItemViews = ({
  handleEdit,
  handleDelete,
  handleView,
  handleUpdateProfile
}: {
  handleEdit?: (id: string) => void;
  handleDelete?: (id: string) => void;
  handleView?: (id: string) => void;
  handleUpdateProfile?: (id: string) => void;
}): {
  columns: ColumnDef<ITrainer>[];
  listItem: (item: ITrainer) => JSX.Element;
} => {
  const columns: ColumnDef<ITrainer>[] = [
    {
      accessorKey: "user.profile.image",
      header: "Profile",
      cell: ({ row }) => {
        const profile = row.original.user?.profile;
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
      accessorKey: "user.email",
      header: "Email",
    },
    {
      accessorKey: "user.profile",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original.user?.profile;
        return profile ? `${profile.firstName} ${profile.lastName}` : '-';
      },
    },
    {
      accessorKey: "user.profile.phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        const profile = row.original.user?.profile;
        return profile?.phoneNumber || '-';
      },
    },
    {
      accessorKey: "user.isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.user?.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const trainer = row.original;

        return (
          <TrainerActions
            trainer={trainer}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleView={handleView}
            handleUpdateProfile={handleUpdateProfile}
          />
        );
      },
    },
  ];

  const listItem = (item: ITrainer) => {
    // React 19: Essential IDs
    const componentId = useId();

    const profile = item.user?.profile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Trainer';
    const imagePath = profile?.image?.url;
    const phoneNumber = profile?.phoneNumber || '-';

    // React 19: Memoized badge class for better performance
    const badgeClass = useMemo(() =>
      item.isActive
        ? 'bg-green-100 text-green-800 border-green-200 border text-xs'
        : 'bg-gray-100 text-gray-800 border-gray-200 border text-xs',
      [item.isActive]
    );

    return (
      <AppCard data-component-id={componentId}>
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Name and Status */}

            <div className="flex items-center gap-1 flex-wrap">
              <Badge className={badgeClass}>
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>


            {/* Profile Image and Contact Info */}
            <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/20">
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {imagePath ? (
                  <img
                    src={encodeURI(`${API_URL}/${imagePath}`)}
                    alt={name}
                    className="w-8 h-8 rounded object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{item.user?.email}</span>
                  </div>
                  {phoneNumber !== '-' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 self-start">
            <TrainerActions
              trainer={item}
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
