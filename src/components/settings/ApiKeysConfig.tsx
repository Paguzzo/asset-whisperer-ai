import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, Settings } from 'lucide-react';

const ApiKeysConfig = () => {
  const apiConfigs = [
    {
      name: 'LUNARCRUSH_API_KEY',
      title: 'LunarCrush API',
      description: 'Dados de sentiment social e análise de criptomoedas',
      docsUrl: 'https://legacy.lunarcrush.com/developers/docs',
      getKeyUrl: 'https://legacy.lunarcrush.com/developers/api',
      status: 'not_configured' // This would be dynamic in real implementation
    },
    {
      name: 'NEWSAPI_KEY',
      title: 'NewsAPI',
      description: 'Coleta de notícias financeiras e de mercado',
      docsUrl: 'https://newsapi.org/docs',
      getKeyUrl: 'https://newsapi.org/register',
      status: 'not_configured'
    },
    {
      name: 'MARKETAUX_API_KEY',
      title: 'Marketaux API',
      description: 'Notícias financeiras e análise de mercado',
      docsUrl: 'https://www.marketaux.com/documentation',
      getKeyUrl: 'https://www.marketaux.com/account/dashboard',
      status: 'not_configured'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <Badge variant="default" className="bg-green-100 text-green-800">Configurado</Badge>;
      case 'not_configured':
        return <Badge variant="secondary">Não Configurado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {apiConfigs.map((config) => (
          <Card key={config.name} className="relative">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div className="flex items-start space-x-3">
                <Key className="h-5 w-5 text-primary mt-1" />
                <div>
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {config.description}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(config.status)}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <a
                  href={config.getKeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Obter API Key
                </a>
                <a
                  href={config.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-muted-foreground hover:underline"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Documentação
                </a>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Para configurar esta API key, clique no botão abaixo:
                </p>
                <div className="text-xs text-muted-foreground">
                  Secret Name: <code className="bg-background px-1 rounded">{config.name}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-800 mb-1">Configuração das API Keys</p>
            <p className="text-blue-700">
              As API keys são armazenadas de forma segura no Supabase Secrets. 
              Após configurar uma chave, ela estará disponível para as funções de coleta de dados automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysConfig;