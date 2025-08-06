
-- Criar tabela para armazenar alertas de preço
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_target', 'stop_loss', 'take_profit', 'support_resistance', 'pre_alert')),
  target_price NUMERIC NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  pre_alert_percentage NUMERIC DEFAULT 5.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_triggered BOOLEAN NOT NULL DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de alertas enviados
CREATE TABLE public.alert_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  alert_id UUID,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  whatsapp_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Criar tabela para configurações do WhatsApp
CREATE TABLE public.whatsapp_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  twilio_account_sid TEXT,
  twilio_auth_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para price_alerts
CREATE POLICY "Users can view their own price alerts" 
  ON public.price_alerts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own price alerts" 
  ON public.price_alerts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price alerts" 
  ON public.price_alerts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price alerts" 
  ON public.price_alerts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para alert_logs
CREATE POLICY "Users can view their own alert logs" 
  ON public.alert_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alert logs" 
  ON public.alert_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas RLS para whatsapp_configs
CREATE POLICY "Users can view their own whatsapp config" 
  ON public.whatsapp_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own whatsapp config" 
  ON public.whatsapp_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whatsapp config" 
  ON public.whatsapp_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar triggers para updated_at
CREATE TRIGGER update_price_alerts_updated_at 
  BEFORE UPDATE ON public.price_alerts 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_configs_updated_at 
  BEFORE UPDATE ON public.whatsapp_configs 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar índices para performance
CREATE INDEX idx_price_alerts_user_asset ON public.price_alerts(user_id, asset_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_logs_user_date ON public.alert_logs(user_id, sent_at);
