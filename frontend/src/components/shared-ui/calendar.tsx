import { useState, useMemo, useId } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import type { CalendarEvent, CalendarProps, CalendarViewType } from '@/@types/calendar/calendar.type';

type ViewType = CalendarViewType;

export default function Calendar({
  events = [],
  onEventClick,
  onDateClick,
  view: initialView = 'month',
  onViewChange,
  showViewToggle = true,
  maxEventsPerDay = 3,
  className = "",
}: CalendarProps) {
  const componentId = useId();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>(initialView);

  // Memoized calendar data
  const calendarData = useMemo(() => {
    if (view === 'day') {
      return [currentDate];
    } else if (view === 'week') {
      const startDate = startOfWeek(currentDate);
      const endDate = endOfWeek(currentDate);
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      // Month view
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const startDate = startOfWeek(start);
      const endDate = endOfWeek(end);
      return eachDayOfInterval({ start: startDate, end: endDate });
    }
  }, [currentDate, view]);

  // Memoized events for current view
  const currentEvents = useMemo(() => {
    console.log('All events:', events);
    console.log('Current date:', currentDate);
    console.log('Current view:', view);
    
    let filteredEvents;
    if (view === 'day') {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return isSameDay(eventDate, currentDate);
      });
    } else if (view === 'week') {
      const startDate = startOfWeek(currentDate);
      const endDate = endOfWeek(currentDate);
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } else {
      // Month view
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return eventDate >= start && eventDate <= end;
      });
    }
    
    console.log('Filtered events for current view:', filteredEvents);
    return filteredEvents;
  }, [events, currentDate, view]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return currentEvents.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return isSameDay(eventDate, date);
    });
  };

  // Navigation
  const goToPrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
    } else if (view === 'week') {
      setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const goToNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
    } else if (view === 'week') {
      setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // View change handler
  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    onViewChange?.(newView);
  };

  // Event click handler
  const handleEventClick = (event: CalendarEvent) => {
    onEventClick?.(event);
  };

  // Date click handler
  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  // Render event badge
  const renderEventBadge = (event: CalendarEvent) => {
    const startTime = format(new Date(event.startDateTime), 'HH:mm');
    const eventColor = event.color || 'bg-blue-100 text-blue-800';
    
    return (
      <Badge
        key={event.id}
        className={`cursor-pointer hover:opacity-80 text-xs ${eventColor}`}
        onClick={() => handleEventClick(event)}
      >
        <Clock className="w-3 h-3 mr-1" />
        {startTime} {event.title}
      </Badge>
    );
  };

  // Render more events indicator
  const renderMoreEvents = (totalEvents: number) => {
    if (totalEvents <= maxEventsPerDay) return null;
    
    const remainingCount = totalEvents - maxEventsPerDay;
    return (
      <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">
        <MoreHorizontal className="w-3 h-3 mr-1" />
        +{remainingCount} more
      </Badge>
    );
  };

  // Generate time slots (24 hours: 00:00 to 23:00)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return {
      time: `${i.toString().padStart(2, '0')}:00`,
      hour: i,
    };
  });

  // Get events for a specific date and time slot
  const getEventsForTimeSlot = (date: Date, hour: number) => {
    const dateEvents = getEventsForDate(date);
    console.log(`Getting events for ${format(date, 'yyyy-MM-dd')} at hour ${hour}:`, dateEvents);
    
    const filteredEvents = dateEvents.filter(event => {
      const eventStart = new Date(event.startDateTime);
      const eventEnd = new Date(event.endDateTime);
      const eventStartHour = eventStart.getHours();
      const eventEndHour = eventEnd.getHours();
      
      console.log(`Event "${event.title}": ${format(eventStart, 'HH:mm')} - ${format(eventEnd, 'HH:mm')} (hours: ${eventStartHour}-${eventEndHour})`);
      
      // Event is in this time slot if:
      // 1. Event starts in this hour, OR
      // 2. Event spans across this hour (starts before and ends after)
      const isInSlot = eventStartHour === hour || (eventStartHour < hour && eventEndHour >= hour);
      console.log(`Event "${event.title}" in slot ${hour}: ${isInSlot}`);
      
      return isInSlot;
    });
    
    console.log(`Filtered events for hour ${hour}:`, filteredEvents);
    return filteredEvents;
  };

  // Render time-based weekly view
  const renderWeeklyTimeView = () => {
    const weekDays = calendarData;
    
    return (
      <div className="flex">
        {/* Time column */}
        <div className="w-20 border-r">
          <div className="h-12 border-b"></div> {/* Header spacer */}
          {timeSlots.map((slot) => (
            <div key={slot.time} className="h-16 border-b text-xs text-muted-foreground p-2">
              {slot.time}
            </div>
          ))}
        </div>
        
        {/* Days columns */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className="border-r last:border-r-0">
              {/* Day header */}
              <div className="h-12 border-b p-2 text-center font-semibold">
                <div className="text-sm">{format(date, 'EEE')}</div>
                <div className="text-lg">{format(date, 'd')}</div>
              </div>
              
              {/* Time slots for this day */}
              {timeSlots.map((slot) => {
                const slotEvents = getEventsForTimeSlot(date, slot.hour);
                return (
                  <div key={slot.time} className="h-16 border-b relative">
                    {slotEvents.map((event, eventIndex) => {
                      const eventStart = new Date(event.startDateTime);
                      const eventEnd = new Date(event.endDateTime);
                      const startMinutes = eventStart.getMinutes();
                      const endMinutes = eventEnd.getMinutes();
                      
                      // Calculate position within the hour slot
                      const topOffset = (startMinutes / 60) * 100; // Percentage from top
                      const height = Math.max(30, ((endMinutes - startMinutes) / 60) * 100); // Minimum height of 30%
                      
                      // Calculate width and position to avoid overlaps
                      const totalEvents = slotEvents.length;
                      const eventWidth = totalEvents > 1 ? `${100 / totalEvents}%` : '100%';
                      const leftOffset = totalEvents > 1 ? `${(eventIndex * 100) / totalEvents}%` : '0%';
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute bg-blue-100 border border-blue-200 rounded text-xs p-1 cursor-pointer hover:bg-blue-200 z-10 overflow-hidden"
                          style={{
                            top: `${topOffset}%`,
                            height: `${height}%`,
                            left: leftOffset,
                            width: eventWidth,
                            minHeight: '24px', // Ensure minimum readable height
                          }}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="font-medium text-xs truncate leading-tight">{event.title}</div>
                          <div className="text-blue-600 text-xs truncate leading-tight">
                            {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render time-based daily view
  const renderDailyTimeView = () => {
    return (
      <div className="flex">
        {/* Time column */}
        <div className="w-20 border-r">
          <div className="h-12 border-b"></div> {/* Header spacer */}
          {timeSlots.map((slot) => (
            <div key={slot.time} className="h-16 border-b text-xs text-muted-foreground p-2">
              {slot.time}
            </div>
          ))}
        </div>
        
        {/* Day column */}
        <div className="flex-1">
          {/* Day header */}
          <div className="h-12 border-b p-4 text-center font-semibold">
            <div className="text-lg">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
            {isToday(currentDate) && (
              <Badge className="bg-blue-100 text-blue-800 mt-1">Today</Badge>
            )}
          </div>
          
          {/* Time slots */}
          {timeSlots.map((slot) => {
            const slotEvents = getEventsForTimeSlot(currentDate, slot.hour);
            return (
              <div key={slot.time} className="h-16 border-b relative">
                {slotEvents.map((event, eventIndex) => {
                  const eventStart = new Date(event.startDateTime);
                  const eventEnd = new Date(event.endDateTime);
                  const startMinutes = eventStart.getMinutes();
                  const endMinutes = eventEnd.getMinutes();
                  
                  // Calculate position within the hour slot
                  const topOffset = (startMinutes / 60) * 100; // Percentage from top
                  const height = Math.max(30, ((endMinutes - startMinutes) / 60) * 100); // Minimum height of 30%
                  
                  // Calculate width and position to avoid overlaps
                  const totalEvents = slotEvents.length;
                  const eventWidth = totalEvents > 1 ? `${100 / totalEvents}%` : '100%';
                  const leftOffset = totalEvents > 1 ? `${(eventIndex * 100) / totalEvents}%` : '0%';
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute bg-blue-100 border border-blue-200 rounded text-xs p-1 cursor-pointer hover:bg-blue-200 z-10 overflow-hidden"
                      style={{
                        top: `${topOffset}%`,
                        height: `${height}%`,
                        left: leftOffset,
                        width: eventWidth,
                        minHeight: '24px', // Ensure minimum readable height
                      }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium text-xs truncate leading-tight">{event.title}</div>
                      <div className="text-blue-600 text-xs truncate leading-tight">
                        {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`} data-component-id={componentId}>
      {/* Calendar Header */}
      <AppCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {view === 'day' 
                ? format(currentDate, 'EEEE, MMMM d, yyyy')
                : view === 'week'
                ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')
              }
            </h2>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            {showViewToggle && (
              <Select value={view} onValueChange={handleViewChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Calendar Grid */}
      <AppCard className="p-0">
        <CardContent className="p-0">
          {view === 'day' ? (
            /* Day Time View */
            renderDailyTimeView()
          ) : view === 'week' ? (
            /* Week Time View */
            renderWeeklyTimeView()
          ) : (
            /* Month View */
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-4 text-center font-semibold text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {calendarData.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentDate);
                  const isTodayDate = isToday(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 ${
                        !isCurrentMonth ? 'bg-gray-50 text-muted-foreground opacity-10' : ''
                      } ${isWeekend ? 'bg-gray-25' : ''} ${isTodayDate ? 'bg-blue-50' : ''}`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isTodayDate ? 'text-blue-600' : ''}`}>
                          {format(date, 'd')}
                        </span>
                        {isTodayDate && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      
                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, maxEventsPerDay).map(renderEventBadge)}
                        {dayEvents.length > maxEventsPerDay && renderMoreEvents(dayEvents.length)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </AppCard>

      {/* Legend */}
      {events.length > 0 && (
        <AppCard className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
              <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
            </div>
          </div>
        </AppCard>
      )}
    </div>
  );
}
