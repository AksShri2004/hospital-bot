'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  medicalRecords: z.string().optional(),
});

// Mock user data
const currentUser = {
  fullName: 'Alex Doe',
  email: 'alex.doe@example.com',
  dob: '1990-05-15',
  medicalRecords: 'Diagnosed with asthma in 2015. Allergic to penicillin. Seasonal allergies to pollen.'
}

export default function ProfilePage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: currentUser,
  });

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    // In a real app, this would update the user's data in the database
    console.log(values);
    toast({
      title: 'Profile Updated',
      description: 'Your medical records and personal information have been saved.',
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            Medical Profile
          </CardTitle>
          <CardDescription>
            Manage your personal and medical information securely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History & Records</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any diagnoses, allergies, surgeries, etc."
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
