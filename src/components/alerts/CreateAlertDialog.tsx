
import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  symbol: string;
  name: string;
}

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateAlertDialog = ({ open, onOpenChange }: CreateAlertDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    asset_id: '',
    alert_type: '',
    target_price: '',
    condition: '',
    pre_alert_percentage: '5',
  });

  // Buscar ativos do usuário
  const { data: assets } = useQuery({
    queryKey: ['user-assets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, symbol, name')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user?.id && open,
  });

  // Mutation para criar alerta
  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const { error } = await supabase
        .from('price_alerts')
        .insert([{
          ...alertData,
          user_id: user?.id,
          target_price: parseFloat(alertData.target_price),
          pre_alert_percentage: parseFloat(alertData.pre_alert_percentage),
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Alerta criado',
        description: 'Seu alerta foi configurado com sucesso.',
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar o alerta. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      asset_id: '',
      alert_type: '',
      target_price: '',
      condition: '',
      pre_alert_percentage: '5',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.asset_id || !formData.alert_type || !formData.target_price || !formData.condition) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    createAlertMutation.mutate(formData);
  };

  const alertTypes = [
    { value: 'price_target', label: 'Meta de Preço' },
    { value: 'stop_loss', label: 'Stop Loss' },
    { value: 'take_profit', label: 'Take Profit' },
    { value: 'support_resistance', label: 'Suporte/Resistência' },
  ];

  const conditions = [
    { value: 'above', label: 'Acima de' },
    { value: 'below', label: 'Abaixo de' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Alerta</DialogTitle>
          <DialogDescription>
            Configure um alerta para receber notificações quando o preço atingir seus critérios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset">Ativo *</Label>
            <Select
              value={formData.asset_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ativo" />
              </SelectTrigger>
              <SelectContent>
                {assets?.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.symbol} - {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert_type">Tipo de Alerta *</Label>
            <Select
              value={formData.alert_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, alert_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {alertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Condição *</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condição" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_price">Preço Alvo (USD) *</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.target_price}
                onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pre_alert_percentage">Pré-alerta (%)</Label>
            <Input
              id="pre_alert_percentage"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={formData.pre_alert_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, pre_alert_percentage: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              Receberá uma notificação quando o preço estiver nesta porcentagem da meta
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createAlertMutation.isPending}
            >
              {createAlertMutation.isPending ? 'Criando...' : 'Criar Alerta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAlertDialog;
