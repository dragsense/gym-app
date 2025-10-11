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
  Pause, 
  Play, 
  Trash2, 
  RefreshCw,
  Clock,
} from "lucide-react";

import { type IQueue } from "@shared/interfaces/queue.interface";
import { type TListHandlerStore } from "@/stores";

export const itemViews = ({
  store,
}: {  
  store: TListHandlerStore<IQueue, any, any>;
}): {
  columns: ColumnDef<IQueue>[];
} => {
  
  const setAction = store.getState().setAction;

  const pauseQueue = (queueName: string) => {
    setAction('pauseQueue', queueName);
  };

  const resumeQueue = (queueName: string) => {
    setAction('resumeQueue', queueName);
  };

  const cleanQueue = (queueName: string) => {
    setAction('cleanQueue', queueName);
  };

  const viewJobs = (queueName: string) => {
    setAction('viewJobs', queueName);
  };

  const columns: ColumnDef<IQueue>[] = [
    {
      accessorKey: "name",
      header: "Queue Name",
      cell: ({ row }) => {
        const name = row.getValue<string>("name");
        return (
          <span className="font-medium">{name}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status") || 'active';
        
        const statusConfig = {
          active: { variant: "default" as const, icon: Play, color: "text-green-600" },
          paused: { variant: "secondary" as const, icon: Pause, color: "text-yellow-600" },
          waiting: { variant: "outline" as const, icon: Clock, color: "text-blue-600" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
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
      accessorKey: "waiting",
      header: "Waiting",
      cell: ({ row }) => {
        const waiting = row.getValue<number>("waiting") || 0;
        return (
          <span className="text-sm">{waiting}</span>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => {
        const active = row.getValue<number>("active") || 0;
        return (
          <span className="text-sm">{active}</span>
        );
      },
    },
    {
      accessorKey: "completed", 
      header: "Completed",
      cell: ({ row }) => {
        const completed = row.getValue<number>("completed") || 0;
        return (
          <span className="text-sm text-green-600">{completed}</span>
        );
      },
    },
    {
      accessorKey: "failed",
      header: "Failed",
      cell: ({ row }) => {
        const failed = row.getValue<number>("failed") || 0;
        return (
          <span className="text-sm text-red-600">{failed}</span>
        );
      },
    },
    {
      accessorKey: "delayed",
      header: "Delayed",
      cell: ({ row }) => {
        const delayed = row.getValue<number>("delayed") || 0;
        return (
          <span className="text-sm text-orange-600">{delayed}</span>
        );
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = row.getValue<number>("total") || 0;
        return (
          <span className="font-medium">{total}</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const queue = row.original;
        
        return (
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewJobs(queue.name)}
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Jobs</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {queue.status === 'active' ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => pauseQueue(queue.name)}
                    >
                      <Pause className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pause Queue</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resumeQueue(queue.name)}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Resume Queue</p>
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
                    onClick={() => cleanQueue(queue.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clean Queue</p>
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