import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bell, Settings, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import HomePage from './HomePage';
import AssetsList from '@/components/assets/AssetsList';

const Index = () => {
  const { user } = useAuth();

  // Show homepage for non-authenticated users
  if (!user) {
    return <HomePage />;
  }
  // Authenticated user dashboard
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Monitore seus ativos e configure alertas.
          </p>
        </div>

        {/* Assets Management Section */}
        <div className="mb-8">
          <AssetsList />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Coleta de Dados</span>
              </CardTitle>
              <CardDescription>
                APIs integradas: Yahoo Finance, Brapi, Binance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="default">Ativo</Badge>
                <p className="text-sm text-muted-foreground">
                  Dados coletados em intervalos de 15min, 4h e diário
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Alertas WhatsApp</span>
              </CardTitle>
              <CardDescription>
                Receba notificações em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Próximo</Badge>
                <p className="text-sm text-muted-foreground">
                  Configure triggers de stop-loss e take-profit
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Insights IA</span>
              </CardTitle>
              <CardDescription>
                Análises preditivas com OpenAI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Em desenvolvimento</Badge>
                <p className="text-sm text-muted-foreground">
                  Tendências e recomendações automáticas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Próximos Passos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">1</Badge>
                  <span>Configurar coleta de dados (Yahoo Finance, Brapi, Binance)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">2</Badge>
                  <span>Integrar notificações WhatsApp via Twilio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">3</Badge>
                  <span>Implementar insights com OpenAI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">4</Badge>
                  <span>Sistema de triggers e alertas</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;