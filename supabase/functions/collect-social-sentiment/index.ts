
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Função para coletar dados do LunarCrush
async function collectLunarCrushData(symbol: string) {
  const apiKey = Deno.env.get('LUNARCRUSH_API_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://api.lunarcrush.com/v2/assets?symbol=${symbol}&key=${apiKey}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const asset = data.data[0];
      return {
        sentiment_score: asset.sentiment || null,
        social_volume: asset.social_volume || 0,
        social_dominance: asset.social_dominance || null,
        bullish_sentiment: asset.bullish_percent || null,
        bearish_sentiment: asset.bearish_percent || null,
        metadata: {
          social_contributors: asset.social_contributors,
          correlations: asset.correlations,
          galaxy_score: asset.galaxy_score
        }
      };
    }
  } catch (error) {
    console.error('LunarCrush API error:', error);
  }
  return null;
}

// Função para coletar dados do Alternative.me (Fear & Greed Index)
async function collectAlternativeData() {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const fng = data.data[0];
      return {
        fear_greed_index: parseInt(fng.value),
        metadata: {
          value_classification: fng.value_classification,
          timestamp: fng.timestamp
        }
      };
    }
  } catch (error) {
    console.error('Alternative.me API error:', error);
  }
  return null;
}

// Função para coletar dados do StockTwits
async function collectStockTwitsData(symbol: string) {
  try {
    const response = await fetch(`https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`);
    const data = await response.json();
    
    if (data.messages) {
      const messages = data.messages;
      const bullishCount = messages.filter((m: any) => m.entities?.sentiment?.basic === 'Bullish').length;
      const bearishCount = messages.filter((m: any) => m.entities?.sentiment?.basic === 'Bearish').length;
      const total = bullishCount + bearishCount;
      
      return {
        social_volume: messages.length,
        bullish_sentiment: total > 0 ? (bullishCount / total) * 100 : null,
        bearish_sentiment: total > 0 ? (bearishCount / total) * 100 : null,
        metadata: {
          total_messages: messages.length,
          bullish_messages: bullishCount,
          bearish_messages: bearishCount
        }
      };
    }
  } catch (error) {
    console.error('StockTwits API error:', error);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting social sentiment collection...');

    // Buscar todos os ativos ativos
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('is_active', true);

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      throw assetsError;
    }

    let processedCount = 0;

    for (const asset of assets || []) {
      try {
        console.log(`Processing sentiment for ${asset.symbol}...`);

        // Coletar dados de diferentes fontes
        const [lunarCrushData, stockTwitsData] = await Promise.all([
          collectLunarCrushData(asset.symbol),
          collectStockTwitsData(asset.symbol)
        ]);

        // Coletar Fear & Greed Index apenas para crypto
        const alternativeData = asset.asset_type === 'crypto' ? await collectAlternativeData() : null;

        // Salvar dados do LunarCrush
        if (lunarCrushData) {
          const { error } = await supabase
            .from('social_sentiment')
            .insert({
              asset_id: asset.id,
              source: 'lunarcrush',
              ...lunarCrushData
            });

          if (error) console.error(`Error saving LunarCrush data for ${asset.symbol}:`, error);
          else processedCount++;
        }

        // Salvar dados do StockTwits
        if (stockTwitsData) {
          const { error } = await supabase
            .from('social_sentiment')
            .insert({
              asset_id: asset.id,
              source: 'stocktwits',
              ...stockTwitsData
            });

          if (error) console.error(`Error saving StockTwits data for ${asset.symbol}:`, error);
          else processedCount++;
        }

        // Salvar dados do Alternative.me
        if (alternativeData) {
          const { error } = await supabase
            .from('social_sentiment')
            .insert({
              asset_id: asset.id,
              source: 'alternative',
              ...alternativeData
            });

          if (error) console.error(`Error saving Alternative.me data for ${asset.symbol}:`, error);
          else processedCount++;
        }

        // Pequeno delay para não sobrecarregar as APIs
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing ${asset.symbol}:`, error);
      }
    }

    console.log(`Social sentiment collection completed. Processed ${processedCount} entries.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Social sentiment data collected for ${assets?.length || 0} assets`,
        processed_entries: processedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in collect-social-sentiment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
