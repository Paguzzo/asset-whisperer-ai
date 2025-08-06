
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
      // Mock data until tables are created
      setSentimentData([]);
      
      toast({
        title: "Info",
        description: "Tabelas de sentimento ainda não foram criadas. Execute a migração SQL primeiro.",
        variant: "default",
      });
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
      // This will work once the edge function and tables are created
      toast({
        title: "Info",
        description: "Função de coleta de sentimento será habilitada após criar as tabelas.",
      });
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

      <Card>
        <CardContent className="text-center p-8">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Tabelas não encontradas</h3>
          <p className="text-muted-foreground mb-4">
            As tabelas de sentimento social ainda não foram criadas. Execute a migração SQL primeiro.
          </p>
          <Button onClick={updateSentimentData} disabled={isUpdating} variant="outline">
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Testar Conexão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
