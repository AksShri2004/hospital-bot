
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
import { FileHeart, Loader2 } from 'lucide-react';
import { withAuth, useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const onboardingFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  dob: z.string().refine((val) => val === '' || !isNaN(Date.parse(val)), { message: "Please enter a valid date." }).optional(),
  abhaId: z.string().optional(),
  medicalRecords: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

function OnboardingPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      abhaId: "",
      medicalRecords: ""
    },
  });

  useEffect(() => {
    if (user?.displayName) {
      form.setValue('fullName', user.displayName);
    }
  }, [user, form]);

  async function onSubmit(values: OnboardingFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const profileData = {
        email: user.email,
        ...values,
      };
      await setDoc(userDocRef, profileData);
      
      toast({
        title: 'Information Saved!',
        description: 'Your medical profile has been created.',
      });
      router.push('/');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: error.message,
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileHeart className="h-6 w-6 text-primary" />
            Complete Your Medical Profile
          </CardTitle>
          <CardDescription>
            Provide some basic medical information to get personalized recommendations. You can skip this and complete it later from your profile page.
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
              </div>
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
              <FormField
                control={form.control}
                name="medicalRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical History & Records (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any known allergies, past surgeries, chronic conditions, etc."
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
              <div className="flex flex-col sm:flex-row gap-2 justify-end items-center">
                 <Button variant="link" asChild>
                    <Link href="/">Skip for now</Link>
                 </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save and Continue
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(OnboardingPage);
