'use client';

import * as React from 'react';
import { format, parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// USA timezone - using America/New_York (Eastern Time) as default
const USA_TIMEZONE = 'America/New_York';

interface DateTimePickerProps {
  value?: string; // ISO string or datetime-local format
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  error,
  placeholder = 'Select date and time',
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );
  const [timeValue, setTimeValue] = React.useState<string>('00:00');
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Get current date/time in USA timezone
  const getCurrentUSADateTime = React.useCallback(() => {
    const now = new Date();
    return toZonedTime(now, USA_TIMEZONE);
  }, []);

  // Initialize from value prop or set to current USA time
  React.useEffect(() => {
    if (value) {
      try {
        // Parse the value (should be ISO string in UTC)
        let utcDate: Date;

        if (value.includes('T') && value.includes('Z')) {
          // ISO string with Z (UTC)
          utcDate = new Date(value);
        } else if (value.includes('T')) {
          // ISO string without Z (assume UTC)
          utcDate = new Date(value.endsWith('Z') ? value : value + 'Z');
        } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Date only - treat as UTC midnight
          utcDate = new Date(value + 'T00:00:00Z');
        } else {
          // datetime-local format (YYYY-MM-DDTHH:mm) - treat as UTC
          utcDate = new Date(value + (value.includes('Z') ? '' : 'Z'));
        }

        // Convert UTC to USA timezone for display
        const usaDate = toZonedTime(utcDate, USA_TIMEZONE);
        setSelectedDate(usaDate);
        setTimeValue(format(usaDate, 'HH:mm'));
        setIsInitialized(true);
      } catch (error) {
        console.error('Error parsing date value:', error);
        // Fallback to current USA time
        const currentUSA = getCurrentUSADateTime();
        setSelectedDate(currentUSA);
        setTimeValue(format(currentUSA, 'HH:mm'));
        setIsInitialized(true);
      }
    } else if (!isInitialized) {
      // No value provided - initialize with current USA time
      const currentUSA = getCurrentUSADateTime();
      setSelectedDate(currentUSA);
      setTimeValue(format(currentUSA, 'HH:mm'));
      setIsInitialized(true);
    }
  }, [value, isInitialized, getCurrentUSADateTime]);

  // Auto-set current USA time when component first mounts and no value is provided
  React.useEffect(() => {
    if (!value && isInitialized && selectedDate && !disabled) {
      // Set the value to current USA time converted to UTC
      // Only do this once on initial mount
      const utcDate = fromZonedTime(selectedDate, USA_TIMEZONE);
      onChange(utcDate.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]); // Only run when initialized, not on every selectedDate change

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange('');
      return;
    }

    setSelectedDate(date);
    updateDateTime(date, timeValue);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (selectedDate) {
      updateDateTime(selectedDate, time);
    }
  };

  const updateDateTime = (date: Date, time: string) => {
    // Parse time (HH:mm format)
    const [hours, minutes] = time.split(':').map(Number);

    // Extract date components from the date (which is in USA timezone for display)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create a date string representing the date/time in USA timezone
    // Format: YYYY-MM-DDTHH:mm:ss (no timezone info)
    const dateTimeString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours || 0).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00`;

    // Parse the date string - this creates a Date object
    // The date represents the time components we want in USA timezone
    const dateInUSA = parse(dateTimeString, 'yyyy-MM-dd\'T\'HH:mm:ss', new Date());

    // Convert from USA timezone to UTC using fromZonedTime
    // fromZonedTime interprets the date's components (year, month, day, hour, minute, second)
    // as if they represent a time in USA_TIMEZONE, then converts to UTC
    const utcDate = fromZonedTime(dateInUSA, USA_TIMEZONE);

    // Format as ISO string for storage
    const isoString = utcDate.toISOString();
    onChange(isoString);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      handleDateSelect(undefined);
      setOpen(false);
      return;
    }

    // If we already have a selected date, preserve the time
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      handleDateSelect(newDate);
    } else {
      // Use current time or 00:00
      const newDate = new Date(date);
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours || 0, minutes || 0, 0, 0);
      handleDateSelect(newDate);
    }
    setOpen(false);
  };

  // Format display value
  const displayValue = React.useMemo(() => {
    if (!selectedDate) return '';

    // selectedDate is already in USA timezone (from utcToZonedTime)
    return format(selectedDate, 'MMM d, yyyy') + ' at ' + format(selectedDate, 'h:mm a');
  }, [selectedDate, timeValue]);

  // Get current date in USA timezone for calendar
  const getCurrentDateInUSA = React.useCallback(() => {
    return toZonedTime(new Date(), USA_TIMEZONE);
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="date-time-picker" className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-time-picker"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
                error && 'border-red-500'
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayValue || <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                initialFocus
                captionLayout="dropdown"
                defaultMonth={selectedDate || getCurrentDateInUSA()}
              />
              <div className="border-t pt-3">
                <Label htmlFor="time-input" className="text-sm font-medium mb-2 block">
                  Time
                </Label>
                <Input
                  id="time-input"
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full"
                  step="60"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Timezone: Eastern Standard Time (EST) - America/New_York (GMT-5)
      </p>
    </div>
  );
};

