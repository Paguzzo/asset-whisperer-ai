import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Bell, Settings, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-6 p-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <TrendingUp className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Asset Whisperer AI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Monitore seus ativos financeiros com inteligência artificial. 
            Receba alertas via WhatsApp e insights preditivos em tempo real.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Ativos Monitorados</span>
              </CardTitle>
              <CardDescription>
                Configure os ativos que você deseja acompanhar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">Em breve</Badge>
                <p className="text-sm text-muted-foreground">
                  Adicione ações brasileiras, americanas e criptomoedas
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
                <Badge variant="secondary">Em breve</Badge>
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
                <Badge variant="secondary">Em breve</Badge>
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
