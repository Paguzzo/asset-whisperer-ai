import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Trash2, Settings } from 'lucide-react';
import AddAssetDialog from './AddAssetDialog';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  exchange?: string;
  is_active: boolean;
  created_at: string;
  price_data?: {
    price: number;
    change_24h: number;
    change_percent_24h: number;
    timestamp: string;
  }[];
}

const AssetsList = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAssets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          price_data (
            price,
            change_24h,
            change_percent_24h,
            timestamp
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAssets(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ativos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAsset = async (assetId: string, symbol: string) => {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Ativo removido",
        description: `${symbol} foi removido do monitoramento.`,
      });

      fetchAssets();
    } catch (error: any) {
      toast({
        title: "Erro ao remover ativo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testDataCollection = async () => {
    try {
      toast({
        title: "Coletando dados...",
        description: "Executando coleta de dados de mercado.",
      });

      const { data, error } = await supabase.functions.invoke('collect-market-data');
      
      if (error) {
        console.error('Erro na coleta:', error);
        toast({
          title: "Erro na coleta",
          description: error.message || "Erro ao coletar dados",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Coleta concluída!",
          description: `Coletados dados para ${data?.collected || 0} ativos.`,
        });
        // Recarregar ativos após coleta
        setTimeout(fetchAssets, 1000);
      }
    } catch (error: any) {
      console.error('Erro na função de coleta:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar coleta de dados",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [user]);

  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case 'brazilian_stock': return 'Ação BR';
      case 'us_stock': return 'Ação US';
      case 'crypto': return 'Crypto';
      default: return type;
    }
  };

  const getLatestPrice = (asset: Asset) => {
    if (!asset.price_data || asset.price_data.length === 0) return null;
    return asset.price_data.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando ativos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ativos Monitorados</h2>
          <p className="text-muted-foreground">
            Configure os ativos que você deseja acompanhar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testDataCollection}>
            Testar Coleta
          </Button>
          <AddAssetDialog onAssetAdded={fetchAssets} />
        </div>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Nenhum ativo configurado</h3>
                <p className="text-muted-foreground">
                  Adicione seu primeiro ativo para começar o monitoramento.
                </p>
              </div>
              <AddAssetDialog onAssetAdded={fetchAssets} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const latestPrice = getLatestPrice(asset);
            const isPositive = latestPrice && latestPrice.change_24h > 0;
            
            return (
              <Card key={asset.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{asset.symbol}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {asset.name}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAsset(asset.id, asset.symbol)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {getAssetTypeLabel(asset.asset_type)}
                    </Badge>
                    {asset.exchange && (
                      <Badge variant="outline">{asset.exchange}</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  {latestPrice ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">
                          {asset.asset_type === 'crypto' ? '$' : 'R$'}
                          {latestPrice.price.toFixed(2)}
                        </span>
                        <div className={`flex items-center ${
                          isPositive ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {isPositive ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="text-sm font-medium">
                            {latestPrice.change_percent_24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Atualizado: {new Date(latestPrice.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <Badge variant="outline">Aguardando dados</Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={testDataCollection}
                        className="text-xs"
                      >
                        Coletar Preços Agora
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssetsList;