import React, { useState, useId, useMemo, useTransition } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DatePickerProps {
  value?: Date;
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = React.memo(({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className
}) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const [open, setOpen] = useState(false);

  // React 19: Memoized display value for better performance
  const displayValue = useMemo(() => 
    value ? new Date(value).toLocaleDateString() : placeholder,
    [value, placeholder]
  );

  // React 19: Smooth popover transitions
  const handleOpenChange = (newOpen: boolean) => {
    startTransition(() => {
      setOpen(newOpen);
    });
  };

  // React 19: Smooth date selection
  const handleDateSelect = (date: Date | undefined) => {
    startTransition(() => {
      const dateString = date ? new Date(date).toISOString() : "";
      onChange(dateString);
      setOpen(false);
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-32 justify-between font-normal ${className}`}
          disabled={disabled}
          data-component-id={componentId}
        >
          {displayValue}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          captionLayout="dropdown"
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = "DatePicker";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = React.memo(({
  value,
  onChange,
  placeholder = "Select date & time",
  disabled = false,
  className
}) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  const [open, setOpen] = useState(false);

  // React 19: Memoized display value for better performance
  const displayValue = useMemo(() => 
    value ? new Date(value).toLocaleString() : placeholder,
    [value, placeholder]
  );

  // React 19: Memoized time value for better performance
  const timeValue = useMemo(() => 
    value ? new Date(value).toTimeString().slice(0, 5) : "",
    [value]
  );

  // React 19: Smooth popover transitions
  const handleOpenChange = (newOpen: boolean) => {
    startTransition(() => {
      setOpen(newOpen);
    });
  };

  // React 19: Smooth date selection
  const handleDateSelect = (date: Date | undefined) => {
    startTransition(() => {
      if (date) {
        const current = new Date(value || new Date());
        date.setHours(current.getHours());
        date.setMinutes(current.getMinutes());
        onChange(date);
      }
    });
  };

  // React 19: Smooth time change
  const handleTimeChange = (timeString: string) => {
    startTransition(() => {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = value ? new Date(value) : new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      onChange(date);
    });
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-auto justify-between font-normal ${className}`}
          disabled={disabled}
          data-component-id={componentId}
        >
          {displayValue}
          <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4 space-y-2" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value ? new Date(value) : undefined}
          onSelect={handleDateSelect}
        />

        <div className="flex items-center gap-2">
          <Label className="text-sm">Time:</Label>
          <Input
            type="time"
            className="border rounded px-2 py-1 text-sm"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
});

DateTimePicker.displayName = "DateTimePicker";
