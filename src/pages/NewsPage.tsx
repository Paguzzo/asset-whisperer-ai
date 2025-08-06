
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import Header from '@/components/layout/Header';
import { NewsSummaries } from '@/components/news/NewsSummaries';

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Newspaper className="h-8 w-8" />
            Resumos de Notícias
          </h2>
          <p className="text-muted-foreground">
            Resumos automáticos das principais notícias do mercado financeiro, gerados por IA.
          </p>
        </div>

        <NewsSummaries />
      </main>
    </div>
  );
};

export default NewsPage;
