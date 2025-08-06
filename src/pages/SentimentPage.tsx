
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import Header from '@/components/layout/Header';
import { SentimentDashboard } from '@/components/sentiment/SentimentDashboard';

const SentimentPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Sentimento Social
          </h2>
          <p className="text-muted-foreground">
            Monitore o sentimento do mercado através de análises de redes sociais e índices especializados.
          </p>
        </div>

        <SentimentDashboard />
      </main>
    </div>
  );
};

export default SentimentPage;
