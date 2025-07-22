'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Doctor, addAppointment } from '@/lib/data';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';

interface AppointmentSchedulerProps {
  doctor: Doctor;
  onBookingConfirmed: () => void;
}

export default function AppointmentScheduler({ doctor, onBookingConfirmed }: AppointmentSchedulerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setSelectedTime(null); // Reset time when date changes
  }

  const handleBooking = () => {
    if (!date || !selectedTime) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Selection',
        description: 'Please select a date and time for your appointment.',
      });
      return;
    }
    
    addAppointment({
      doctor,
      date: format(date, 'yyyy-MM-dd'),
      time: selectedTime,
    });

    toast({
      title: 'Appointment Booked!',
      description: `Your appointment with ${doctor.name} on ${format(date, 'PPP')} at ${selectedTime} is confirmed.`,
      className: "bg-accent text-accent-foreground border-accent-foreground/20",
    });
    onBookingConfirmed();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableTimes = date ? doctor.availability[format(date, 'yyyy-MM-dd')] || [] : [];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2 text-center">Select a Date</h4>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(day) => day < today}
          className="rounded-md border flex justify-center"
        />
      </div>
      {date && (
        <div className="animate-in fade-in duration-300">
          <h4 className="font-medium mb-2 text-center">Select a Time for {format(date, 'PPP')}</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <p className="col-span-3 text-sm text-muted-foreground text-center py-4">No available slots for this day.</p>
            )}
          </div>
        </div>
      )}
      <DialogFooter className="mt-4">
        <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
        </DialogClose>
        <Button onClick={handleBooking} disabled={!date || !selectedTime}>
          Confirm Appointment
        </Button>
      </DialogFooter>
    </div>
  );
}
