// External Libraries
import { Search } from "lucide-react";

// Custom UI Components
import { Input } from "@/components/ui/input";

// Utilities
import { cn } from "@/lib/utils";


interface SearchProps {
  search: string
  onSearchChange: (searchTerm: string) => void
  className?: string
  placeholder?: string
 
}
export default function AppSearch({ placeholder, search, onSearchChange, className }: SearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4 " />
      <Input
        value={search}
        placeholder={placeholder ?? "search..."}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className={cn("pl-10", className)}
      />
    </div>
  )
}
