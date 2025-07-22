
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { analyzeSymptoms, AnalyzeSymptomsOutput } from '@/ai/flows/analyze-symptoms';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DoctorCard from './DoctorCard';
import { getDoctorsBySpecialization, Doctor } from '@/lib/data';
import { Badge } from './ui/badge';

const formSchema = z.object({
  symptoms: z.string().min(10, { message: 'Please describe your symptoms in at least 10 characters.' }),
  medicalRecords: z.string().optional(),
});

export default function SymptomChecker() {
  const [analysis, setAnalysis] = useState<AnalyzeSymptomsOutput | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symptoms: '',
      medicalRecords: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysis(null);
    setRecommendedDoctors([]);
    try {
      const result = await analyzeSymptoms({
        symptoms: values.symptoms,
        medicalRecords: values.medicalRecords || 'No past medical records provided.',
      });
      setAnalysis(result);
      if (result.relevantDoctorSpecializations.length > 0) {
        const doctors = await getDoctorsBySpecialization(result.relevantDoctorSpecializations);
        setRecommendedDoctors(doctors);
      } else {
        const doctors = await getDoctorsBySpecialization(['General Practitioner']);
        setRecommendedDoctors(doctors);
      }
    } catch (error) {
      console.error('Symptom analysis failed:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'There was an error analyzing your symptoms. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div id="symptom-checker" className="max-w-4xl mx-auto">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="text-primary h-6 w-6" />
            AI Symptom Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I have a persistent cough, fever, and headache..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Please be as detailed as possible for a more accurate analysis.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Past Medical Records (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Diagnosed with asthma in 2015, allergic to penicillin..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Providing your medical history can help improve the recommendation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Symptoms'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="text-center p-12">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground text-lg">Our AI is analyzing your symptoms...</p>
         </div>
      )}

      {analysis && (
        <div className="mt-12 animate-in fade-in duration-500">
          <h2 className="text-3xl font-bold text-center mb-8">Analysis Results</h2>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recommended Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.relevantDoctorSpecializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.relevantDoctorSpecializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-base px-3 py-1">{spec}</Badge>
                  ))}
                </div>
              ) : (
                <p>No specific specializations could be determined. We recommend consulting a General Practitioner.</p>
              )}
            </CardContent>
          </Card>

          {recommendedDoctors.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-center mb-6">Recommended Doctors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
