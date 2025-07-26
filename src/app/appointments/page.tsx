
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppointments, Appointment } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Loader2, Stethoscope } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { withAuth, useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const getBadgeVariant = (status: Appointment['status']) => {
    switch (status) {
      case 'Upcoming':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
    }
  };

  const isPast = new Date(appointment.date) < new Date() && appointment.status === 'Upcoming';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium">
          {appointment.doctor.name}
        </CardTitle>
        <Badge variant={isPast ? 'outline' : getBadgeVariant(appointment.status)}>
          {isPast ? 'Past' : appointment.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="flex items-center text-muted-foreground text-sm">
            <Stethoscope className="mr-2 h-4 w-4"/>
            <span>{appointment.doctor.specialization}</span>
        </div>
        <Separator />
        <div className="flex items-center text-sm">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{appointment.time}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      if (!user) {
        setIsLoading(false);
        return;
      };

      setIsLoading(true);
      try {
        const fetchedAppointments = await getAppointments();
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAppointments();
  }, [user]);

  if (isLoading) {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming' && new Date(a.date) >= new Date()).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastAppointments = appointments.filter(a => a.status !== 'Upcoming' || new Date(a.date) < new Date()).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Appointments</h1>
      
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Upcoming</h2>
        {upcomingAppointments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
          </div>
        ) : (
          <Card className="flex items-center justify-center p-12 bg-secondary/50">
            <p className="text-muted-foreground">You have no upcoming appointments.</p>
          </Card>
        )}
      </section>

      <Separator className="my-12" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Past & Cancelled</h2>
        {pastAppointments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastAppointments.map(app => <AppointmentCard key={app.id} appointment={app} />)}
          </div>
        ) : (
           <Card className="flex items-center justify-center p-12 bg-secondary/50">
            <p className="text-muted-foreground">You have no past appointments.</p>
          </Card>
        )}
      </section>
    </div>
  );
}


export default withAuth(AppointmentsPage);
