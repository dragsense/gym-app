export interface CalendarEvent {
  id: string | number;
  title: string;
  startDateTime: Date | string;
  endDateTime: Date | string;
  type?: string;
  status?: string;
  color?: string;
  [key: string]: any;
}

export interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  view?: 'month' | 'week' | 'day';
  onViewChange?: (view: 'month' | 'week' | 'day') => void;
  showViewToggle?: boolean;
  maxEventsPerDay?: number;
  className?: string;
}

export type CalendarViewType = 'month' | 'week' | 'day';
