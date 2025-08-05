import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InsightCard } from "./InsightCard";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Insight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  confidence_score: number;
  created_at: string;
  asset_id: string;
  metadata?: any;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

export function InsightsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('ai_insights' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedAsset !== "all") {
        query = query.eq('asset_id', selectedAsset);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insights:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar insights",
          variant: "destructive",
        });
        return;
      }

      setInsights((data as unknown as Insight[]) || []);
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

  const generateInsight = async (assetId: string) => {
    if (!user) return;

    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          asset_id: assetId,
          user_id: user.id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Insight gerado com sucesso!",
      });

      // Refresh insights list
      await fetchInsights();
    } catch (error) {
      console.error('Error generating insight:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar insight. Verifique se há dados de preço disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInsightForSelectedAsset = () => {
    if (selectedAsset === "all") {
      toast({
        title: "Seleção necessária",
        description: "Selecione um ativo específico para gerar insight",
        variant: "destructive",
      });
      return;
    }
    generateInsight(selectedAsset);
  };

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchInsights();
    }
  }, [user, selectedAsset]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando insights...</span>
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
                <Brain className="h-5 w-5" />
                Insights IA
              </CardTitle>
              <CardDescription>
                Análises técnicas e recomendações geradas por inteligência artificial
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
                onClick={generateInsightForSelectedAsset}
                disabled={isGenerating || selectedAsset === "all"}
                size="sm"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                <span className="ml-2">Gerar Insight</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchInsights}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="text-center p-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum insight disponível</h3>
            <p className="text-muted-foreground mb-4">
              {selectedAsset === "all" 
                ? "Nenhum insight foi gerado ainda. Selecione um ativo e clique em 'Gerar Insight'."
                : "Nenhum insight encontrado para este ativo. Clique em 'Gerar Insight' para criar um."
              }
            </p>
            {assets.length > 0 && selectedAsset === "all" && (
              <p className="text-sm text-muted-foreground">
                Certifique-se de que há dados de preço coletados para seus ativos.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}