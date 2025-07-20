import SymptomChecker from '@/components/SymptomChecker';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Intelligent Symptom Analysis
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Describe your symptoms and our AI will suggest the right specialist for you. Get personalized doctor recommendations in seconds.
        </p>
      </section>

      <SymptomChecker />
    </div>
  );
}
