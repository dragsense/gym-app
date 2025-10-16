import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import Calendar from "@/components/shared-ui/calendar";
import { type CalendarEvent } from "@/@types/calendar/calendar.type";
import { AppCard } from "@/components/layout-ui/app-card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

// Services
import { fetchSessions } from "@/services/session.api";

// Types
import { type ISession } from "@shared/interfaces/session.interface";
import { ESessionStatus } from "@shared/enums/session.enum";


interface ISessionsCalendarProps {
  onCreateSession?: () => void;
  onEventClick?: (session: ISession) => void;
}

export default function SessionsCalendar({ onCreateSession, onEventClick }: ISessionsCalendarProps) {

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions-calendar'],
    queryFn: () => fetchSessions({
      _relations: '',
      _select: 'title, startDateTime, endDateTime, type, status, location, price',
    }),
  });

  // Transform sessions to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    if (!sessionsData?.data) return [];

    return sessionsData.data.map((session: ISession) => ({
      id: session.id,
      title: session.title,
      startDateTime: session.startDateTime,
      endDateTime: session.endDateTime,
      type: session.type,
      status: session.status,
      color: getEventColor(session.status),
      session: session, // Keep reference to original session
    }));
  }, [sessionsData]);

  // Get color based on session status
  function getEventColor(status: ESessionStatus): string {
    switch (status) {
      case ESessionStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case ESessionStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case ESessionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ESessionStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ESessionStatus.NO_SHOW:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    if (event.session) {
      onEventClick?.(event.session);
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    // You could open a form to create a session for this date
    console.log('Date clicked:', date);
  };

  // Handle create session
  const handleCreateSession = () => {
    onCreateSession?.();
  };

  if (isLoading) {
    return (
      <AppCard className="p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        </div>
      </AppCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
  
      {/* Calendar */}
      <Calendar
        events={calendarEvents}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        showViewToggle={true}
        maxEventsPerDay={3}
      />


    </div>
  );
}
