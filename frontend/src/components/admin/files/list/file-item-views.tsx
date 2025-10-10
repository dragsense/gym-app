import { Eye, Pencil, Trash2 } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

// Types
import { type IFileUpload } from "@shared/interfaces/file-upload.interface";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface IItemViewArgs {
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}

export const itemViews = ({
  handleEdit,
  handleDelete,
  handleView,
}: IItemViewArgs) => {
  const columns: ColumnDef<IFileUpload>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "File Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.mimeType}</span>
        </div>
      ),
    },
    {
      accessorKey: "size",
      header: "Size",
      cell: ({ row }) => {
        const sizeInKB = (row.original.size / 1024).toFixed(2);
        const sizeInMB = (row.original.size / (1024 * 1024)).toFixed(2);
        return (
          <span className="text-sm">
            {parseFloat(sizeInMB) >= 1 ? `${sizeInMB} MB` : `${sizeInKB} KB`}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded",
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  const listItem = (item: IFileUpload) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-lg">{item.name}</span>
          <Badge variant="outline">{item.mimeType}</Badge>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Size: {item.size >= 1024 * 1024
              ? `${(item.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(item.size / 1024).toFixed(2)} KB`}
          </span>
          <span>Uploaded: {new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleView(item.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(item.id)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(item.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );

  return { columns, listItem };
};

