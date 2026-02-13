import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPageProps {
  onNavigate: (page: 'home' | 'calendar' | 'peers' | 'account') => void;
  onLogout: () => void;
}

export function CalendarPage({ onNavigate, onLogout }: CalendarPageProps) {
  const { state, dispatch } = useStore();
  const { events } = state;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  useRef<HTMLDivElement>(null);

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);

  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === day.getDate() &&
             eventDate.getMonth() === day.getMonth() &&
             eventDate.getFullYear() === day.getFullYear();
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = () => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'createEvent', open: true } });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get upcoming events (next 7 days)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.startDate);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return eventDate >= today && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="calendar" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black">Calendar</h1>
            <p className="text-neutral-500 mt-1">Manage your study schedule</p>
          </div>
          
          <Button
            onClick={handleAddEvent}
            className="bg-black text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-neutral-200">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-neutral-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-neutral-100 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    className="border-neutral-300"
                  >
                    Today
                  </Button>
                  <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                        viewMode === 'month'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                        viewMode === 'week'
                          ? 'bg-white text-black shadow-sm'
                          : 'text-neutral-500 hover:text-black'
                      }`}
                    >
                      Week
                    </button>
                  </div>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const isToday = day && 
                    day.getDate() === new Date().getDate() &&
                    day.getMonth() === new Date().getMonth() &&
                    day.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                        day
                          ? 'bg-white border-neutral-100 hover:border-neutral-300'
                          : 'bg-neutral-50 border-transparent'
                      } ${isToday ? 'ring-2 ring-black ring-offset-1' : ''}`}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-black' : 'text-neutral-700'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className="text-xs px-2 py-1 rounded bg-black text-white truncate"
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-neutral-500 text-center">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="p-6 border border-neutral-200">
              <h3 className="font-semibold text-black mb-4">Upcoming This Week</h3>
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No events this week
                  </p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-black mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-black truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(event.startDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        {event.workspaceName && (
                          <p className="text-xs text-neutral-400">
                            {event.workspaceName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 border border-neutral-200">
              <h3 className="font-semibold text-black mb-4">This Month</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <p className="text-2xl font-bold text-black">
                    {events.filter(e => e.type === 'test' && 
                      new Date(e.startDate).getMonth() === currentDate.getMonth()
                    ).length}
                  </p>
                  <p className="text-sm text-neutral-500">Tests</p>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <p className="text-2xl font-bold text-black">
                    {events.filter(e => e.type === 'deadline' && 
                      new Date(e.startDate).getMonth() === currentDate.getMonth()
                    ).length}
                  </p>
                  <p className="text-sm text-neutral-500">Deadlines</p>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <p className="text-2xl font-bold text-black">
                    {events.filter(e => e.type === 'study-session' && 
                      new Date(e.startDate).getMonth() === currentDate.getMonth()
                    ).length}
                  </p>
                  <p className="text-sm text-neutral-500">Study Sessions</p>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                  <p className="text-2xl font-bold text-black">
                    {events.filter(e => 
                      new Date(e.startDate).getMonth() === currentDate.getMonth()
                    ).length}
                  </p>
                  <p className="text-sm text-neutral-500">Total Events</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
