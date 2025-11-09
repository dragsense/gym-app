import { useId } from "react";
import { Calendar, Clock, MapPin, DollarSign, User, Edit, Trash2, Eye } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { type ISession } from "@shared/interfaces/session.interface";
import { ESessionStatus } from "@shared/enums/session.enum";
import type { ColumnDef } from "@tanstack/react-table";
import type { IUserSettings } from "@shared/interfaces/settings.interface";

// Utils
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { buildSentence } from "@/locales/translations";

interface ISessionItemViewsProps {
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleView: (id: string) => void;
  settings?: IUserSettings;
  componentId?: string;
  t: (key: string) => string;
}

export function sessionItemViews({ handleEdit, handleDelete, handleView, settings, componentId = "session-item-views", t }: ISessionItemViewsProps) {

  // Table columns
  const columns: ColumnDef<ISession>[] = [
    {
      accessorKey: 'title',
      header: t('title'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'trainer',
      header: t('trainer'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.trainer?.user?.firstName} {row.original.trainer?.user?.lastName}</span>
        </div>
      ),
    },
    {
      id: 'clientsCount',
      header: t('clients'),
      cell: ({ row }) => <span>{row.original.clientsCount}</span>,
    },
    {
      id: 'startDateTime',
      header: buildSentence(t, 'start', 'time'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatDateTime(row.original.startDateTime, settings)}</span>
        </div>
      ),
    },
    {
      id: 'duration',
      header: t('duration'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.duration} {t('minutes')}</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: t('type'),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: t('status'),
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
      header: t('price'),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.price ? formatCurrency(row.original.price, undefined, undefined, 2, 2, settings) : t('free')}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: t('actions'),
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
        <h3 className="font-semibold text-lg">{session.title}</h3>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
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
              <span><strong>{t('trainer')}:</strong> {session.trainerUser?.firstName} {session.trainerUser?.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span><strong>{t('clients')}:</strong> {session.clientsCount} {t('clients')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>{t('start')}:</strong> {formatDateTime(session.startDateTime, settings)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>{t('duration')}:</strong> {session.duration} {t('minutes')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span><strong>{t('end')}:</strong> {formatDateTime(session.endDateTime, settings)}</span>
            </div>
            {session.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span><strong>{t('location')}:</strong> {session.location}</span>
              </div>
            )}
            {session.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span><strong>{t('price')}:</strong> {formatCurrency(session.price, undefined, undefined, 2, 2, settings)}</span>
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
