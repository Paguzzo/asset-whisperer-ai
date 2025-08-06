
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
      let query = supabase
        .from('news_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (selectedType !== "all") {
        query = query.eq('summary_type', selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching summaries:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar resumos de notícias",
          variant: "destructive",
        });
        return;
      }

      setSummaries(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async (summaryType: string) => {
    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-news-summaries', {
        body: { summary_type: summaryType }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Resumo ${summaryType} gerado com sucesso!`,
      });

      // Refresh summaries
      await fetchSummaries();
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

      {summaries.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum resumo disponível</h3>
            <p className="text-muted-foreground mb-4">
              Não há resumos de notícias disponíveis. Gere um novo resumo para começar.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => generateSummary('4h')} disabled={isGenerating} variant="outline">
                Resumo 4h
              </Button>
              <Button onClick={() => generateSummary('daily')} disabled={isGenerating}>
                Resumo Diário
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <Card key={summary.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSummaryTypeIcon(summary.summary_type)}
                    <CardTitle className="text-lg">{summary.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getSummaryTypeLabel(summary.summary_type)}
                    </Badge>
                    <Badge variant="secondary">
                      {summary.articles_count} artigos
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Gerado em {new Date(summary.created_at).toLocaleString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas de Sentimento */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {getSentimentIcon(summary.sentiment_overview.average)}
                    </div>
                    <div className={`text-sm font-medium ${getSentimentColor(summary.sentiment_overview.average)}`}>
                      Sentimento Médio
                    </div>
                    <div className="text-lg font-bold">
                      {(summary.sentiment_overview.average * 100).toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-green-600 text-lg font-bold">
                      {summary.sentiment_overview.positive}
                    </div>
                    <div className="text-sm text-muted-foreground">Positivas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-red-600 text-lg font-bold">
                      {summary.sentiment_overview.negative}
                    </div>
                    <div className="text-sm text-muted-foreground">Negativas</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-yellow-600 text-lg font-bold">
                      {summary.sentiment_overview.neutral}
                    </div>
                    <div className="text-sm text-muted-foreground">Neutras</div>
                  </div>
                </div>

                {/* Análise de Impacto */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm font-medium">Impacto no Mercado:</span>
                  <Badge 
                    variant={
                      summary.market_impact_analysis === 'Positivo' ? 'default' :
                      summary.market_impact_analysis === 'Negativo' ? 'destructive' : 'secondary'
                    }
                  >
                    {summary.market_impact_analysis}
                  </Badge>
                </div>

                {/* Conteúdo do Resumo */}
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {summary.content}
                  </div>
                </div>

                {/* Eventos Chave */}
                {summary.key_events && summary.key_events.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Eventos de Alto Impacto:</h4>
                    <div className="space-y-2">
                      {summary.key_events.slice(0, 3).map((event: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {(event.impact_score * 100).toFixed(0)}%
                          </Badge>
                          <span className="flex-1">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
