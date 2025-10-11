// External Libraries
import { type JSX } from "react";
import { type ColumnDef } from "@tanstack/react-table";

// Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  RefreshCw, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play
} from "lucide-react";

import { type IQueueJob } from "@shared/interfaces/queue.interface";

export const itemViews = ({
  retryJob,
  removeJob,
}: {  
  retryJob: (jobId: string) => void;
  removeJob: (jobId: string) => void;
}): {
  columns: ColumnDef<IQueueJob>[];
} => {
  const columns: ColumnDef<IQueueJob>[] = [
    {
      accessorKey: "id",
      header: "Job ID",
      cell: ({ row }) => {
        const id = row.getValue<string>("id");
        return (
          <span className="font-mono text-sm">{id}</span>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Job Name",
      cell: ({ row }) => {
        const name = row.getValue<string>("name");
        return (
          <span className="font-medium">{name || 'N/A'}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status") || 'waiting';
        
        const statusConfig = {
          waiting: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
          active: { variant: "default" as const, icon: Play, color: "text-yellow-600" },
          completed: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
          failed: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
          delayed: { variant: "outline" as const, icon: AlertCircle, color: "text-orange-600" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting;
        const Icon = config.icon;

        return (
          <Badge variant={config.variant} className={config.color}>
            <Icon className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const progress = row.getValue<number>("progress") || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: "Created",
      cell: ({ row }) => {
        const timestamp = row.getValue<number>("timestamp");
        return (
          <span className="text-sm text-gray-600">
            {new Date(timestamp).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "data.action",
      header: "Action",
      cell: ({ row }) => {
        const action = row.original.data?.action;
        return (
          <div className="max-w-xs truncate">
            <span className="text-sm text-gray-600">
              {action || 'N/A'}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        
        return (
          <div className="flex gap-1">
            {(job.status === 'failed' || job.status === 'completed') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryJob(job.id)}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Retry Job</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeJob(job.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove Job</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  return { columns };
};
