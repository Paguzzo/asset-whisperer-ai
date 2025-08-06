
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

interface WhatsAppConfig {
  id: string;
  phone_number: string;
  is_verified: boolean;
  is_active: boolean;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
}

interface WhatsAppConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfig?: WhatsAppConfig | null;
}

const WhatsAppConfigDialog = ({ open, onOpenChange, currentConfig }: WhatsAppConfigDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    phone_number: '',
    twilio_account_sid: '',
    twilio_auth_token: '',
  });

  useEffect(() => {
    if (currentConfig) {
      setFormData({
        phone_number: currentConfig.phone_number || '',
        twilio_account_sid: currentConfig.twilio_account_sid || '',
        twilio_auth_token: currentConfig.twilio_auth_token || '',
      });
    } else {
      setFormData({
        phone_number: '',
        twilio_account_sid: '',
        twilio_auth_token: '',
      });
    }
  }, [currentConfig]);

  // Mutation para salvar configuração
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const dataToSave = {
        ...configData,
        user_id: user?.id,
      };

      if (currentConfig) {
        const { error } = await supabase
          .from('whatsapp_configs')
          .update(dataToSave)
          .eq('id', currentConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('whatsapp_configs')
          .insert([dataToSave]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] });
      toast({
        title: 'Configuração salva',
        description: 'Suas configurações do WhatsApp foram salvas com sucesso.',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar as configurações. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para enviar mensagem de teste
  const testMessageMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-test-whatsapp', {
        body: {
          phone_number: formData.phone_number,
          twilio_account_sid: formData.twilio_account_sid,
          twilio_auth_token: formData.twilio_auth_token,
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Mensagem enviada',
        description: 'Mensagem de teste enviada! Verifique seu WhatsApp.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível enviar a mensagem de teste. Verifique suas credenciais.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.twilio_account_sid || !formData.twilio_auth_token) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para configurar o WhatsApp.',
        variant: 'destructive',
      });
      return;
    }

    saveConfigMutation.mutate(formData);
  };

  const handleTestMessage = () => {
    if (!formData.phone_number || !formData.twilio_account_sid || !formData.twilio_auth_token) {
      toast({
        title: 'Configuração incompleta',
        description: 'Preencha todos os campos antes de testar.',
        variant: 'destructive',
      });
      return;
    }

    testMessageMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configurar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configure sua integração com WhatsApp via Twilio para receber alertas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentConfig?.is_verified && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                WhatsApp configurado e verificado para {currentConfig.phone_number}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Para usar esta funcionalidade, você precisa de uma conta no Twilio. 
              Acesse <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="underline">twilio.com</a> para criar sua conta.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Número WhatsApp *</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+5511999999999"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Incluir código do país (ex: +5511999999999)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilio_account_sid">Twilio Account SID *</Label>
              <Input
                id="twilio_account_sid"
                type="text"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.twilio_account_sid}
                onChange={(e) => setFormData(prev => ({ ...prev, twilio_account_sid: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twilio_auth_token">Twilio Auth Token *</Label>
              <Input
                id="twilio_auth_token"
                type="password"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={formData.twilio_auth_token}
                onChange={(e) => setFormData(prev => ({ ...prev, twilio_auth_token: e.target.value }))}
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestMessage}
                disabled={testMessageMutation.isPending}
              >
                {testMessageMutation.isPending ? 'Enviando...' : 'Testar Mensagem'}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saveConfigMutation.isPending}
                >
                  {saveConfigMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppConfigDialog;
