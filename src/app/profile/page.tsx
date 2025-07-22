
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';
import { withAuth, useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email(),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }).optional().or(z.literal('')),
  abhaId: z.string().optional(),
  medicalRecords: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dob: "",
      abhaId: "",
      medicalRecords: ""
    },
  });

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          form.reset(userDoc.data() as ProfileFormValues);
        } else {
          // Prefill from auth if no profile exists
          form.reset({
            fullName: user.displayName || '',
            email: user.email || '',
          });
        }
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user, form]);


  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, values, { merge: true });

      // Update auth profile if name changed
      if (user.displayName !== values.fullName) {
        await updateProfile(user, { displayName: values.fullName });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your medical records and personal information have been saved.',
      });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: 'Update Failed',
            description: error.message,
        });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (isLoading) {
    return (
       <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
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
                        <Input type="email" placeholder="your@email.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="abhaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ABHA ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 12-3456-7890-1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
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
                    <FormDescription>
                      This information helps our AI provide more accurate suggestions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(ProfilePage);
