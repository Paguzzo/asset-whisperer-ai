-- Create table for assets that users want to monitor
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('brazilian_stock', 'us_stock', 'crypto')),
  exchange TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol, asset_type)
);

-- Create table for price data
CREATE TABLE public.price_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(20, 8),
  market_cap DECIMAL(20, 2),
  change_24h DECIMAL(10, 4),
  change_percent_24h DECIMAL(10, 4),
  interval_type TEXT NOT NULL CHECK (interval_type IN ('15min', '4h', 'daily')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('yahoo', 'brapi', 'binance')),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for monitoring configurations
CREATE TABLE public.monitoring_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  intervals JSONB NOT NULL DEFAULT '["15min", "4h", "daily"]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_price DECIMAL(20, 8),
  stop_loss_price DECIMAL(20, 8),
  take_profit_price DECIMAL(20, 8),
  pre_alert_percentage DECIMAL(5, 2) DEFAULT 5.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

-- Enable Row Level Security
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" 
ON public.assets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assets" 
ON public.assets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" 
ON public.assets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" 
ON public.assets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for price_data
CREATE POLICY "Users can view price data for their assets" 
ON public.price_data 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.assets 
  WHERE assets.id = price_data.asset_id 
  AND assets.user_id = auth.uid()
));

CREATE POLICY "System can insert price data" 
ON public.price_data 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for monitoring_configs
CREATE POLICY "Users can view their own monitoring configs" 
ON public.monitoring_configs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monitoring configs" 
ON public.monitoring_configs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitoring configs" 
ON public.monitoring_configs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitoring configs" 
ON public.monitoring_configs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_symbol_type ON public.assets(symbol, asset_type);
CREATE INDEX idx_price_data_asset_id ON public.price_data(asset_id);
CREATE INDEX idx_price_data_timestamp ON public.price_data(timestamp DESC);
CREATE INDEX idx_price_data_interval ON public.price_data(interval_type);
CREATE INDEX idx_monitoring_configs_user_id ON public.monitoring_configs(user_id);
CREATE INDEX idx_monitoring_configs_asset_id ON public.monitoring_configs(asset_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitoring_configs_updated_at
BEFORE UPDATE ON public.monitoring_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();