import { useMemo } from "react";
import { List, Table } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IViewToggleProps {
    componentId: string;
    viewType?: "table" | "list";
    className?: string;
}

export function ViewToggle({ componentId, className = "" }: IViewToggleProps) {
    const renderViewToggle = useMemo(() => (
        <TabsList className={`flex justify-center items-center w-auto ${className}`} data-component-id={componentId}>
            <TabsTrigger
                value="table"
                className="flex items-center gap-2 px-4 data-[state=active]:text-foreground data-[state=active]:font-semibold"
            >
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
            </TabsTrigger>

            <TabsTrigger
                value="list"
                className="flex items-center gap-2 px-4 data-[state=active]:text-foreground data-[state=active]:font-semibold"
            >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
            </TabsTrigger>
        </TabsList>
    ), [componentId, className]);

    return renderViewToggle;
}

