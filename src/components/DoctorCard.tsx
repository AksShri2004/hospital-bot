'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Stethoscope, MapPin } from 'lucide-react';
import type { Doctor } from '@/lib/data';
import AppointmentScheduler from './AppointmentScheduler';
import { useState } from 'react';

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-center gap-4">
        <Image
          src={doctor.image}
          alt={`Dr. ${doctor.name}`}
          width={80}
          height={80}
          className="rounded-full border-2 border-primary/20"
          data-ai-hint="doctor portrait"
        />
        <div>
          <CardTitle>{doctor.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Stethoscope className="h-4 w-4" />
            <span>{doctor.specialization}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{doctor.location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book with {doctor.name}</DialogTitle>
              <DialogDescription>
                Select a date and time for your appointment.
              </DialogDescription>
            </DialogHeader>
            <AppointmentScheduler doctor={doctor} onBookingConfirmed={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
