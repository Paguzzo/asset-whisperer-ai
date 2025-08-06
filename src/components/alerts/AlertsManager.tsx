
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, BellOff, Target, TrendingDown, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreateAlertDialog from './CreateAlertDialog';
import WhatsAppConfigDialog from './WhatsAppConfigDialog';

interface Alert {
  id: string;
  asset_id: string;
  alert_type: string;
  target_price: number;
  condition: string;
  pre_alert_percentage: number;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  assets?: {
    symbol: string;
    name: string;
  } | null;
}

interface WhatsAppConfig {
  id: string;
  phone_number: string;
  is_verified: boolean;
  is_active: boolean;
}

const AlertsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);

  // Buscar alertas do usuário
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: async () => {
      // First get the alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      // Then get the assets data separately
      const alertsWithAssets: Alert[] = [];
      
      if (alertsData) {
        for (const alert of alertsData) {
          const { data: assetData, error: assetError } = await supabase
            .from('assets')
            .select('symbol, name')
            .eq('id', alert.asset_id)
            .single();

          alertsWithAssets.push({
            ...alert,
            assets: assetError ? null : assetData
          });
        }
      }

      return alertsWithAssets;
    },
    enabled: !!user?.id,
  });

  // Buscar configuração WhatsApp
  const { data: whatsappConfig } = useQuery({
    queryKey: ['whatsapp-config', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data as WhatsAppConfig | null;
    },
    enabled: !!user?.id,
  });

  // Mutation para ativar/desativar alerta
  const toggleAlertMutation = useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Alerta atualizado',
        description: 'Status do alerta foi alterado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o alerta.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar alerta
  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Alerta removido',
        description: 'Alerta foi removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover o alerta.',
        variant: 'destructive',
      });
    },
  });

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_target':
        return <Target className="h-4 w-4" />;
      case 'stop_loss':
        return <TrendingDown className="h-4 w-4" />;
      case 'take_profit':
        return <TrendingUp className="h-4 w-4" />;
      case 'support_resistance':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeName = (type: string) => {
    const names: Record<string, string> = {
      price_target: 'Meta de Preço',
      stop_loss: 'Stop Loss',
      take_profit: 'Take Profit',
      support_resistance: 'Suporte/Resistência',
    };
    return names[type] || type;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando alertas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alertas de Preço</h2>
          <p className="text-muted-foreground">
            Configure alertas para seus ativos e receba notificações via WhatsApp
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setWhatsappDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Configurar WhatsApp
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Alerta
          </Button>
        </div>
      </div>

      {/* Status WhatsApp */}
      {whatsappConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Status WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{whatsappConfig.phone_number}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {whatsappConfig.is_verified ? 'Verificado' : 'Não verificado'}
                </p>
              </div>
              <Badge variant={whatsappConfig.is_verified ? 'default' : 'secondary'}>
                {whatsappConfig.is_verified ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <div className="grid gap-4">
        {alerts && alerts.length > 0 ? (
          alerts.map((alert) => (
            <Card key={alert.id} className={alert.is_triggered ? 'border-orange-200' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertTypeIcon(alert.alert_type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {alert.assets?.symbol || 'N/A'}
                        </h3>
                        <Badge variant="outline">
                          {getAlertTypeName(alert.alert_type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.assets?.name || 'Asset não encontrado'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {formatPrice(alert.target_price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.condition === 'above' ? 'Acima de' : 'Abaixo de'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Pré-alerta: </span>
                      <span className="font-medium">{alert.pre_alert_percentage}%</span>
                    </div>
                    {alert.is_triggered && alert.triggered_at && (
                      <Badge variant="secondary">
                        Disparado em {new Date(alert.triggered_at).toLocaleString('pt-BR')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleAlertMutation.mutate({
                          alertId: alert.id,
                          isActive: !alert.is_active,
                        })
                      }
                      disabled={toggleAlertMutation.isPending}
                    >
                      {alert.is_active ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum alerta configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro alerta para receber notificações sobre seus ativos
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Criar Primeiro Alerta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateAlertDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <WhatsAppConfigDialog
        open={whatsappDialogOpen}
        onOpenChange={setWhatsappDialogOpen}
        currentConfig={whatsappConfig}
      />
    </div>
  );
};

export default AlertsManager;
