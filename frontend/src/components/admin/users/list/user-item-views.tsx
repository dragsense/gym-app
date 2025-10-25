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
import type { IUser } from "@shared/interfaces/user.interface";
import { EUserRole, EUserLevels } from "@shared/enums/user.enum";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to get role name from level
const getUserRoleFromLevel = (level: number): string => {
  const roleEntry = Object.entries(EUserLevels).find(([, lvl]) => lvl === level);
  return roleEntry ? roleEntry[0] : 'USER';
};


const UserActions = ({
  user,
  handleEdit,
  handleDelete,
  handleView,
  handleUpdateProfile,
}: {
  user: IUser;
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
      startTransition(() => handleView(user.id));
    }
  };

  const handleUpdateProfileClick = () => {
    if (handleUpdateProfile) {
      startTransition(() => handleUpdateProfile(user.id));
    }
  };

  const handleEditClick = () => {
    if (handleEdit) {
      startTransition(() => handleEdit(user.id));
    }
  };

  const handleDeleteClick = () => {
    if (handleDelete) {
      startTransition(() => handleDelete(user.id));
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

export const userItemViews = ({
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
  columns: ColumnDef<IUser>[];
  listItem: (item: IUser) => JSX.Element;
} => {
  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "profile.image",
      header: "Profile",
      cell: ({ row }) => {
        const profile = row.original.profile;
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
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "profile",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original.profile;
        return profile ? `${profile.firstName} ${profile.lastName}` : '-';
      },
    },
    {
      accessorKey: "profile.phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        const profile = row.original.profile;
        return profile?.phoneNumber || '-';
      },
    },
    {
      accessorKey: "level",
      header: "Role",
      cell: ({ row }) => {
        const level = row.getValue<number>("level");
        const roleName = getUserRoleFromLevel(level);
        const roleColors = {
          [EUserRole.ADMIN]: "bg-red-100 text-red-800 border-red-200",
          [EUserRole.TRAINER]: "bg-blue-100 text-blue-800 border-blue-200",
          [EUserRole.CLIENT]: "bg-green-100 text-green-800 border-green-200",
          [EUserRole.USER]: "bg-gray-100 text-gray-800 border-gray-200"
        };
        return (
          <Badge className={`${roleColors[roleName as EUserRole] || roleColors[EUserRole.USER]} text-xs`}>
            {roleName}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>("isActive");
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
        const user = row.original;

        return (
          <UserActions
            user={user}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleView={handleView}
            handleUpdateProfile={handleUpdateProfile}
          />
        );
      },
    },
  ];

  const listItem = (item: IUser) => {
    // React 19: Essential IDs
    const componentId = useId();

    const profile = item.profile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown User';
    const imagePath = profile?.image?.url;
    const phoneNumber = profile?.phoneNumber || '-';
    const roleName = getUserRoleFromLevel(item.level || 3); // Default to USER level

    // React 19: Memoized badge classes for better performance
    const statusBadgeClass = useMemo(() =>
      item.isActive
        ? 'bg-green-100 text-green-800 border-green-200 border text-xs'
        : 'bg-gray-100 text-gray-800 border-gray-200 border text-xs',
      [item.isActive]
    );

    const roleBadgeClass = useMemo(() => {
      const roleColors = {
        [EUserRole.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
        [EUserRole.TRAINER]: 'bg-blue-100 text-blue-800 border-blue-200',
        [EUserRole.CLIENT]: 'bg-green-100 text-green-800 border-green-200',
        [EUserRole.USER]: 'bg-gray-100 text-gray-800 border-gray-200'
      };
      return `${roleColors[roleName as EUserRole] || roleColors[EUserRole.USER]} text-xs`;
    }, [roleName]);

    return (
      <AppCard data-component-id={componentId}>
        <div className="flex gap-3 justify-between w-full">
          <div className="flex-1 space-y-3">
            {/* Header with Name and Status */}

            <div className="flex items-center gap-1 flex-wrap">
              <Badge className={roleBadgeClass}>
                {roleName}
              </Badge>
              <Badge className={statusBadgeClass}>
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
                    <span className="truncate">{item.email}</span>
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
          <div className="flex-1 flex justify-end">
            <UserActions
              user={item}
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