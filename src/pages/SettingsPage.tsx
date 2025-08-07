import Header from '@/components/layout/Header';
import ApiKeysConfig from '@/components/settings/ApiKeysConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">
                Configure suas API keys e preferências do sistema
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Configure as chaves de API necessárias para coleta de dados de sentiment social e notícias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysConfig />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;