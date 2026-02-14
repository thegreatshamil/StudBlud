import { useState } from 'react';
import { useStore } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/types';
import { generateId } from '@/data/mock';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (event: CalendarEvent) => void;
}

const eventTypes: { value: CalendarEvent['type']; label: string }[] = [
  { value: 'test', label: 'Test / Exam' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'study-session', label: 'Study Session' },
  { value: 'other', label: 'Other' },
];

export function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const { state } = useStore();
  const { workspaces } = state;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] =
    useState<CalendarEvent['type']>('study-session');
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<string>('personal');
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;

    setIsLoading(true);

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes);

    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes);

    const workspace =
      selectedWorkspace === 'personal'
        ? undefined
        : workspaces.find((w) => w.id === selectedWorkspace);

    const newEvent: CalendarEvent = {
      id: generateId('event'),
      workspaceId:
        selectedWorkspace === 'personal'
          ? undefined
          : selectedWorkspace,
      workspaceName: workspace?.name,
      workspaceColor: workspace?.color,
      title,
      description,
      startDate,
      endDate,
      type: eventType,
      createdBy: state.currentUser?.id || '',
    };

    await new Promise((r) => setTimeout(r, 300));

    setIsLoading(false);
    onSuccess(newEvent);
    resetForm();
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setEventType('study-session');
    setSelectedWorkspace('personal');
    setDate(new Date());
    setStartTime('09:00');
    setEndTime('10:00');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-2">
            <Label>Event Title</Label>
            <Input
              placeholder="e.g., Physics Midterm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as CalendarEvent['type'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workspace */}
          <div className="space-y-2">
            <Label>Workspace (optional)</Label>
            <Select
              value={selectedWorkspace}
              onValueChange={setSelectedWorkspace}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>

                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isLoading || !title}
              className="bg-black text-white hover:bg-neutral-800"
            >
              {isLoading ? 'Adding...' : 'Add Event'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
