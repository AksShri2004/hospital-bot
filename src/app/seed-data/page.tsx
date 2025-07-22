'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { mockDoctors } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

function SeedDataPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);

    try {
      const doctorsCollection = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsCollection);
      
      if (!snapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Database Not Empty',
          description: 'Your "doctors" collection already contains data. Seeding was aborted to prevent duplicates.',
        });
        setError('The "doctors" collection is not empty.');
        setIsSeeded(true); // Treat as "done" for UI purposes
        return;
      }
      
      for (const doctor of mockDoctors) {
        await addDoc(doctorsCollection, doctor);
      }
      
      setIsSeeded(true);
      toast({
        title: 'Success!',
        description: 'The doctor data has been successfully added to your database.',
        className: "bg-accent text-accent-foreground border-accent-foreground/20",
      });

    } catch (e: any) {
      console.error("Error seeding data: ", e);
      setError(e.message);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'There was an error while trying to seed the database.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore 'doctors' collection with the initial set of mock doctor data. This is a one-time operation.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Button onClick={handleSeed} disabled={isSeeding || isSeeded} size="lg">
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding Data...
              </>
            ) : isSeeded ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Data Seeded
              </>
            ) : (
              'Seed Doctor Data'
            )}
          </Button>
          {error && (
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SeedDataPage;
