import { useId } from "react";
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, User, Users, Edit, Trash2, Eye, AlertCircle } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { type IBilling } from "@shared/interfaces/billing.interface";
import { EBillingStatus, EBillingType } from "@shared/enums/billing.enum";
import type { ColumnDef } from "@tanstack/react-table";
import { EScheduleFrequency } from "@shared/enums/schedule.enum";

interface IBillingItemViewsProps {
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleView: (id: string) => void;
}

export function billingItemViews({ handleEdit, handleDelete, handleView }: IBillingItemViewsProps) {
  const componentId = useId();

  // Table columns
  const columns: ColumnDef<IBilling>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{row.original.amount}</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type.toLowerCase()}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const billing = row.original;
        const statusColors = {
          [EBillingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
          [EBillingStatus.PAID]: 'bg-green-100 text-green-800',
          [EBillingStatus.OVERDUE]: 'bg-red-100 text-red-800',
          [EBillingStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
          [EBillingStatus.REFUNDED]: 'bg-blue-100 text-blue-800',
        };

        return (
          <Badge className={statusColors[billing.status] || 'bg-gray-100 text-gray-800'}>
            {billing.status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      id: 'issueDate',
      header: 'Issue Date',
      cell: ({ row }) => {
        const billing = row.original;

        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(billing.issueDate), 'MMM dd, yyyy')}</span>
          </div>
        );
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const billing = row.original;
        const isOverdue = new Date(billing.dueDate) < new Date() && billing.status === EBillingStatus.PENDING;

        return (
          <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : ""}`}>
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(billing.dueDate), 'MMM dd, yyyy')}</span>
            {isOverdue && <AlertCircle className="h-4 w-4" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'recipientUser',
      header: 'Recipient',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.recipientUser?.profile?.firstName} {row.original.recipientUser?.profile?.lastName}</span>
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
  const listItem = (billing: IBilling) => {
    const isOverdue = new Date(billing.dueDate) < new Date() && billing.status === EBillingStatus.PENDING;
    const statusColors = {
      [EBillingStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [EBillingStatus.PAID]: 'bg-green-100 text-green-800',
      [EBillingStatus.OVERDUE]: 'bg-red-100 text-red-800',
      [EBillingStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
      [EBillingStatus.REFUNDED]: 'bg-blue-100 text-blue-800',
    };

    return (
      <AppCard className="p-4 hover:shadow-md transition-shadow" data-component-id={componentId}>
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">{billing.title}</h3>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="capitalize">{billing.type.toLowerCase()}</Badge>
              <Badge className={statusColors[billing.status] || 'bg-gray-100 text-gray-800'}>
                {billing.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span><strong>Amount:</strong> ${billing.amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span><strong>Recipient:</strong> {billing.recipientUser?.profile?.firstName} {billing.recipientUser?.profile?.lastName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span><strong>Issue Date:</strong> {format(new Date(billing.issueDate), 'MMM dd, yyyy')}</span>
              </div>
              <div className={`flex items-center gap-2 ${isOverdue ? "text-red-600" : ""}`}>
                <Calendar className="h-4 w-4" />
                <span><strong>Due Date:</strong> {format(new Date(billing.dueDate), 'MMM dd, yyyy')}</span>
                {isOverdue && <AlertCircle className="h-4 w-4" />}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span><strong>Recurrence:</strong> {billing.recurrence}</span>
              </div>

            </div>

            {billing.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {billing.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(billing.id)}
              data-component-id={componentId}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(billing.id)}
              data-component-id={componentId}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(billing.id)}
              data-component-id={componentId}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AppCard>
    );
  };

  return { columns, listItem };
}