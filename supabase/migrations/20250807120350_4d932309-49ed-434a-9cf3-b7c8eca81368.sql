-- Create social_sentiment table for LunarCrush and other social sentiment data
CREATE TABLE public.social_sentiment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL,
  user_id UUID NOT NULL,
  source TEXT NOT NULL, -- 'lunarcrush', 'alternative', 'stocktwits'
  sentiment_score NUMERIC,
  social_volume NUMERIC,
  social_dominance NUMERIC,
  social_contributors NUMERIC,
  market_cap_rank INTEGER,
  galaxy_score NUMERIC,
  alt_rank INTEGER,
  sentiment_absolute NUMERIC,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_articles table for NewsAPI and Marketaux data
CREATE TABLE public.news_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  sentiment_score NUMERIC,
  impact_score NUMERIC,
  entities TEXT[],
  snippet TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_summaries table for AI-generated summaries
CREATE TABLE public.news_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary_type TEXT NOT NULL, -- '4h', 'daily'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  articles_count INTEGER NOT NULL DEFAULT 0,
  sentiment_overview TEXT,
  key_events TEXT[],
  market_impact_analysis TEXT,
  confidence_score NUMERIC,
  raw_articles JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create news_article_assets junction table for linking articles to assets
CREATE TABLE public.news_article_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_article_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  relevance_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(news_article_id, asset_id)
);

-- Enable RLS on all tables
ALTER TABLE public.social_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_article_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_sentiment
CREATE POLICY "System can insert social sentiment data" 
ON public.social_sentiment 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view social sentiment for their assets" 
ON public.social_sentiment 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM assets 
  WHERE assets.id = social_sentiment.asset_id 
  AND assets.user_id = auth.uid()
));

-- RLS Policies for news_articles
CREATE POLICY "System can insert news articles" 
ON public.news_articles 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read news articles" 
ON public.news_articles 
FOR SELECT 
USING (true);

-- RLS Policies for news_summaries
CREATE POLICY "System can insert news summaries" 
ON public.news_summaries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own news summaries" 
ON public.news_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for news_article_assets
CREATE POLICY "System can insert news article asset links" 
ON public.news_article_assets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view news article asset links for their assets" 
ON public.news_article_assets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM assets 
  WHERE assets.id = news_article_assets.asset_id 
  AND assets.user_id = auth.uid()
));

-- Add foreign key constraints
ALTER TABLE public.news_article_assets 
ADD CONSTRAINT fk_news_article_assets_news_article 
FOREIGN KEY (news_article_id) REFERENCES public.news_articles(id) ON DELETE CASCADE;

ALTER TABLE public.news_article_assets 
ADD CONSTRAINT fk_news_article_assets_asset 
FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_social_sentiment_asset_id ON public.social_sentiment(asset_id);
CREATE INDEX idx_social_sentiment_created_at ON public.social_sentiment(created_at);
CREATE INDEX idx_social_sentiment_source ON public.social_sentiment(source);

CREATE INDEX idx_news_articles_published_at ON public.news_articles(published_at);
CREATE INDEX idx_news_articles_source ON public.news_articles(source);
CREATE INDEX idx_news_articles_sentiment_score ON public.news_articles(sentiment_score);

CREATE INDEX idx_news_summaries_user_id ON public.news_summaries(user_id);
CREATE INDEX idx_news_summaries_created_at ON public.news_summaries(created_at);
CREATE INDEX idx_news_summaries_summary_type ON public.news_summaries(summary_type);

CREATE INDEX idx_news_article_assets_asset_id ON public.news_article_assets(asset_id);
CREATE INDEX idx_news_article_assets_news_article_id ON public.news_article_assets(news_article_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_social_sentiment_updated_at
  BEFORE UPDATE ON public.social_sentiment
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_summaries_updated_at
  BEFORE UPDATE ON public.news_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();