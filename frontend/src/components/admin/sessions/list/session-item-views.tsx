import { useId } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, DollarSign, User, Edit, Trash2, Eye } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { type ISession } from "@shared/interfaces/session.interface";
import { ESessionStatus } from "@shared/enums/session.enum";
import type { ColumnDef } from "@tanstack/react-table";

interface ISessionItemViewsProps {
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}

export function sessionItemViews({ handleEdit, handleDelete, handleView }: ISessionItemViewsProps) {
  const componentId = useId();

  // Table columns
  const columns: ColumnDef<ISession>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'trainer',
      header: 'Trainer',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.trainer?.user?.profile?.firstName} {row.original.trainer?.user?.profile?.lastName}</span>
        </div>
      ),
    },
    {
      id: 'clientsCount',
      header: 'Clients',
      cell: ({ row }) => <span>{row.original.clientsCount}</span>,
    },
    {
      id: 'startDateTime',
      header: 'Start Time',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(row.original.startDateTime), 'MMM dd, yyyy HH:mm')}</span>
        </div>
      ),
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.duration} minutes</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const session = row.original;
        const statusColors = {
          [ESessionStatus.SCHEDULED]: 'bg-blue-100 text-blue-800',
          [ESessionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
          [ESessionStatus.COMPLETED]: 'bg-green-100 text-green-800',
          [ESessionStatus.CANCELLED]: 'bg-red-100 text-red-800',
          [ESessionStatus.NO_SHOW]: 'bg-gray-100 text-gray-800',
        };
        
        return (
          <Badge className={statusColors[session.status] || 'bg-gray-100 text-gray-800'}>
            {session.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.price ? `${row.original.price}` : 'Free'}</span>
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
  const listItem = (session: ISession) => (
    <AppCard className="p-4 hover:shadow-md transition-shadow" data-component-id={componentId}>
      <div className="space-y-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg">{session.title}</h3>
            <Badge variant="outline">{session.type}</Badge>
            <Badge className={
              session.status === ESessionStatus.SCHEDULED ? 'bg-blue-100 text-blue-800' :
              session.status === ESessionStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' :
              session.status === ESessionStatus.COMPLETED ? 'bg-green-100 text-green-800' :
              session.status === ESessionStatus.CANCELLED ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }>
              {session.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>Trainer:</strong> {session.trainer?.user?.profile?.firstName} {session.trainer?.user?.profile?.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>Clients:</strong> {session.clientsCount} client(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>Start:</strong> {format(new Date(session.startDateTime), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>Duration:</strong> {session.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>End:</strong> {format(new Date(session.endDateTime), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            {session.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span><strong>Location:</strong> {session.location}</span>
              </div>
            )}
            {session.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span><strong>Price:</strong> ${session.price}</span>
              </div>
            )}
          </div>
          
          {session.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(session.id)}
            data-component-id={componentId}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(session.id)}
            data-component-id={componentId}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(session.id)}
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
