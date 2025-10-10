// External Libraries
import { type JSX } from "react";
import { type ColumnDef } from "@tanstack/react-table";



// Types
import type { IActivityLog } from "@shared/interfaces/activity-log.interface";
import { Badge } from "@/components/ui/badge";


export const itemViews = (): {
  columns: ColumnDef<IActivityLog>[];
  listItem: (item: IActivityLog) => JSX.Element;
} => {
  const columns: ColumnDef<IActivityLog>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "description",
      header: "Description",
    
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
    },
    {
      accessorKey: "userAgent",
      header: "User Agent",
      cell: ({row}) => {
        const userAgent = row.getValue<string>("userAgent");
        return (
          <p className="max-w-30 truncate">
            {userAgent}
          </p>
        );
      }
    },
    {
      accessorKey: "endpoint",
      header: "End Point",
    },
    {
      accessorKey: "method",
      header: "Method",
    },
    {
      accessorKey: "statusCode",
      header: "Status Code",
    },
    {
      accessorKey: "errorMessage",
      header: "Error Message",
    },
    {
      accessorKey: "user.email",
      header: "User",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge variant={"secondary"}>
            {status}
          </Badge>
        );
      },
    },
   
  ];

  const listItem = (item: IActivityLog) => {
    return <div>Not Provided</div>;
  };

  return { columns, listItem };
};