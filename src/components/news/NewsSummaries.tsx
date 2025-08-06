
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Newspaper, RefreshCw, Loader2, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NewsSummary {
  id: string;
  title: string;
  content: string;
  summary_type: string;
  articles_count: number;
  sentiment_overview: {
    average: number;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  key_events: any[];
  market_impact_analysis: string;
  created_at: string;
}

export function NewsSummaries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [summaries, setSummaries] = useState<NewsSummary[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSummaries = async () => {
    if (!user) return;

    try {
      // Mock data until tables are created
      setSummaries([]);
      
      toast({
        title: "Info",
        description: "Tabelas de resumos ainda não foram criadas. Execute a migração SQL primeiro.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (summaryType: string) => {
    setIsGenerating(true);
    try {
      // This will work once the edge function and tables are created
      toast({
        title: "Info",
        description: `Função de geração de resumo ${summaryType} será habilitada após criar as tabelas.`,
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar resumo de notícias",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSummaryTypeLabel = (type: string) => {
    const labels = {
      '4h': '4 Horas',
      'daily': 'Diário',
      'weekly': 'Semanal'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getSummaryTypeIcon = (type: string) => {
    const icons = {
      '4h': <Clock className="h-4 w-4" />,
      'daily': <Newspaper className="h-4 w-4" />,
      'weekly': <TrendingUp className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <Newspaper className="h-4 w-4" />;
  };

  const getSentimentColor = (average: number) => {
    if (average > 0.1) return 'text-green-600';
    if (average < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (average: number) => {
    if (average > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (average < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 bg-yellow-500 rounded-full" />;
  };

  useEffect(() => {
    if (user) {
      fetchSummaries();
    }
  }, [user, selectedType]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando resumos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Resumos de Notícias
              </CardTitle>
              <CardDescription>
                Resumos automáticos das principais notícias do mercado
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="4h">4 Horas</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => generateSummary('daily')}
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Gerar Resumo</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="text-center p-8">
          <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tabelas não encontradas</h3>
          <p className="text-muted-foreground mb-4">
            As tabelas de resumos de notícias ainda não foram criadas. Execute a migração SQL primeiro.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => generateSummary('4h')} disabled={isGenerating} variant="outline">
              Testar Resumo 4h
            </Button>
            <Button onClick={() => generateSummary('daily')} disabled={isGenerating} variant="outline">
              Testar Resumo Diário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
