
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SentimentData {
  id: string;
  source: string;
  sentiment_score: number | null;
  social_volume: number | null;
  social_dominance: number | null;
  bullish_sentiment: number | null;
  bearish_sentiment: number | null;
  fear_greed_index: number | null;
  timestamp: string;
  assets: {
    symbol: string;
    name: string;
  } | null;
}

export function SentimentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSentimentData = async () => {
    try {
      let query = supabase
        .from('social_sentiment')
        .select(`
          *,
          assets (
            symbol,
            name
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (selectedAsset !== "all") {
        query = query.eq('asset_id', selectedAsset);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sentiment data:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de sentimento",
          variant: "destructive",
        });
        return;
      }

      setSentimentData(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssets = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('assets')
      .select('id, symbol, name')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching assets:', error);
      return;
    }

    setAssets(data || []);
  };

  const updateSentimentData = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('collect-social-sentiment');

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Dados de sentimento atualizados!",
      });

      // Refresh data
      await fetchSentimentData();
    } catch (error) {
      console.error('Error updating sentiment:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados de sentimento",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getSentimentIcon = (score: number | null) => {
    if (score === null) return <Activity className="h-4 w-4 text-muted-foreground" />;
    if (score > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  const getSentimentLabel = (score: number | null) => {
    if (score === null) return "Neutro";
    if (score > 0.5) return "Muito Positivo";
    if (score > 0.1) return "Positivo";
    if (score < -0.5) return "Muito Negativo";
    if (score < -0.1) return "Negativo";
    return "Neutro";
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      lunarcrush: "🚀",
      stocktwits: "💬",
      alternative: "😰",
      santiment: "📊"
    };
    return icons[source as keyof typeof icons] || "📈";
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchSentimentData();
    }
  }, [user, selectedAsset]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando dados de sentimento...</span>
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
                <Activity className="h-5 w-5" />
                Sentimento Social
              </CardTitle>
              <CardDescription>
                Análise de sentimento de redes sociais e mercado
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os ativos</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.symbol} - {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={updateSentimentData}
                disabled={isUpdating}
                size="sm"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Atualizar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {sentimentData.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground mb-4">
              Não há dados de sentimento social disponíveis.
            </p>
            <Button onClick={updateSentimentData} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Coletar Dados Agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sentimentData.map((data) => (
            <Card key={data.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSourceIcon(data.source)}</span>
                    <div>
                      <CardTitle className="text-sm">
                        {data.assets?.symbol || 'Mercado Geral'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {data.source.charAt(0).toUpperCase() + data.source.slice(1)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getSentimentIcon(data.sentiment_score)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.sentiment_score !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sentimento</span>
                    <Badge variant={data.sentiment_score > 0.1 ? "default" : data.sentiment_score < -0.1 ? "destructive" : "secondary"}>
                      {getSentimentLabel(data.sentiment_score)}
                    </Badge>
                  </div>
                )}
                
                {data.social_volume && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volume Social</span>
                    <span className="text-sm font-medium">{data.social_volume.toLocaleString()}</span>
                  </div>
                )}

                {data.bullish_sentiment !== null && data.bearish_sentiment !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-600">Otimista</span>
                      <span className="text-red-600">Pessimista</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div 
                        className="bg-green-500 rounded-l"
                        style={{ width: `${data.bullish_sentiment}%` }}
                      />
                      <div 
                        className="bg-red-500 rounded-r"
                        style={{ width: `${data.bearish_sentiment}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>{data.bullish_sentiment.toFixed(1)}%</span>
                      <span>{data.bearish_sentiment.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {data.fear_greed_index && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fear & Greed</span>
                    <Badge variant={data.fear_greed_index > 50 ? "default" : "destructive"}>
                      {data.fear_greed_index}
                    </Badge>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  {new Date(data.timestamp).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
