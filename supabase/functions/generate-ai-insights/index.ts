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

interface PriceData {
  price: number;
  change_24h: number;
  change_percent_24h: number;
  volume?: number;
  market_cap?: number;
  timestamp: string;
}

interface TechnicalIndicators {
  sma9: number;
  sma21: number;
  sma50: number;
  rsi: number;
  signals: string[];
  trend: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  user_id: string;
}

// Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const sum = prices.slice(0, period).reduce((acc, price) => acc + price, 0);
  return sum / period;
}

// Calculate RSI
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // neutral RSI if not enough data
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i-1] - prices[i];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate technical indicators
function calculateTechnicalIndicators(priceData: PriceData[]): TechnicalIndicators {
  const prices = priceData.map(p => p.price);
  
  const sma9 = calculateSMA(prices, 9);
  const sma21 = calculateSMA(prices, 21);
  const sma50 = calculateSMA(prices, 50);
  const rsi = calculateRSI(prices);
  
  const signals: string[] = [];
  const currentPrice = prices[0];
  
  // Detect moving average signals
  if (sma9 > sma21 && sma21 > sma50) {
    signals.push('Tendência de alta confirmada (MM9 > MM21 > MM50)');
  } else if (sma9 < sma21 && sma21 < sma50) {
    signals.push('Tendência de baixa confirmada (MM9 < MM21 < MM50)');
  }
  
  // Price vs moving averages
  if (currentPrice > sma9 && currentPrice > sma21) {
    signals.push('Preço acima das médias de curto prazo');
  } else if (currentPrice < sma9 && currentPrice < sma21) {
    signals.push('Preço abaixo das médias de curto prazo');
  }
  
  // RSI signals
  if (rsi > 70) {
    signals.push('RSI em zona de sobrecompra (>70)');
  } else if (rsi < 30) {
    signals.push('RSI em zona de sobrevenda (<30)');
  } else if (rsi > 50) {
    signals.push('RSI indica força compradora');
  } else {
    signals.push('RSI indica pressão vendedora');
  }
  
  // Determine overall trend
  let trend = 'Lateral';
  if (sma9 > sma21 && currentPrice > sma21) trend = 'Alta';
  else if (sma9 < sma21 && currentPrice < sma21) trend = 'Baixa';
  
  return {
    sma9,
    sma21,
    sma50,
    rsi,
    signals,
    trend
  };
}

async function generateInsight(asset: Asset, priceData: PriceData[], userId: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Calculate technical indicators
  const technicalIndicators = calculateTechnicalIndicators(priceData);
  
  // Prepare market data context
  const latestPrice = priceData[0];
  const previousPrices = priceData.slice(1, 6); // Last 5 data points
  
  const priceHistory = previousPrices.map(p => ({
    price: p.price,
    change: p.change_percent_24h,
    timestamp: p.timestamp
  }));

  const prompt = `
Analise os dados de mercado do ativo ${asset.symbol} (${asset.name}) e gere insights técnicos e de tendência baseados nos indicadores técnicos calculados.

DADOS ATUAIS:
- Preço atual: $${latestPrice.price}
- Variação 24h: ${latestPrice.change_percent_24h}%
- Volume: ${latestPrice.volume || 'N/A'}
- Tipo de ativo: ${asset.asset_type}

INDICADORES TÉCNICOS CALCULADOS:
- Média Móvel 9 períodos (MM9): $${technicalIndicators.sma9.toFixed(4)}
- Média Móvel 21 períodos (MM21): $${technicalIndicators.sma21.toFixed(4)}
- Média Móvel 50 períodos (MM50): $${technicalIndicators.sma50.toFixed(4)}
- RSI (14 períodos): ${technicalIndicators.rsi.toFixed(2)}
- Tendência identificada: ${technicalIndicators.trend}

SINAIS TÉCNICOS DETECTADOS:
${technicalIndicators.signals.map(signal => `- ${signal}`).join('\n')}

HISTÓRICO RECENTE (últimos 5 pontos):
${priceHistory.map(p => `- $${p.price} (${p.change}%) em ${new Date(p.timestamp).toLocaleDateString()}`).join('\n')}

Com base nos indicadores técnicos calculados e sinais detectados, forneça:
1. Análise de tendência confirmada pelos indicadores (alta/baixa/lateral)
2. Interpretação das médias móveis e seus cruzamentos
3. Análise do RSI e condições de sobrecompra/sobrevenda
4. Níveis de suporte/resistência baseados nas médias móveis
5. Recomendação de ação (comprar, vender, aguardar) fundamentada nos indicadores
6. Pontos de entrada/saída sugeridos
7. Confiança na análise (1-10) baseada na convergência dos indicadores

Responda em português brasileiro, seja técnico mas acessível. Foque em insights práticos para trading baseados nos indicadores calculados.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista técnico experiente em mercados financeiros. Forneça análises precisas e práticas baseadas nos dados fornecidos.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const insight = data.choices[0].message.content;

  // Extract confidence score from the insight (simple regex)
  const confidenceMatch = insight.match(/confiança.*?(\d+)/i);
  const confidenceScore = confidenceMatch ? parseInt(confidenceMatch[1]) / 10 : 0.7;

  // Determine insight type based on content
  let insightType = 'technical_analysis';
  if (insight.toLowerCase().includes('comprar')) insightType = 'buy_signal';
  else if (insight.toLowerCase().includes('vender')) insightType = 'sell_signal';
  else if (insight.toLowerCase().includes('aguardar')) insightType = 'hold_signal';

  // Store insight in database
  const { error: insertError } = await supabase
    .from('ai_insights')
    .insert({
      user_id: userId,
      asset_id: asset.id,
      title: `Análise Técnica - ${asset.symbol}`,
      content: insight,
      insight_type: insightType,
      confidence_score: confidenceScore,
      metadata: {
        current_price: latestPrice.price,
        change_24h: latestPrice.change_percent_24h,
        analysis_timestamp: new Date().toISOString(),
        price_points_analyzed: priceData.length
      }
    });

  if (insertError) {
    console.error('Error storing insight:', insertError);
    throw new Error('Failed to store insight');
  }

  return {
    insight,
    confidence_score: confidenceScore,
    insight_type: insightType
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asset_id, user_id } = await req.json();

    if (!asset_id || !user_id) {
      return new Response(
        JSON.stringify({ error: 'asset_id and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating AI insight for asset ${asset_id} and user ${user_id}`);

    // Get asset details
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', asset_id)
      .eq('user_id', user_id)
      .single();

    if (assetError || !asset) {
      console.error('Asset not found:', assetError);
      return new Response(
        JSON.stringify({ error: 'Asset not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent price data for the asset (increased to 60 for better technical analysis)
    const { data: priceData, error: priceError } = await supabase
      .from('price_data')
      .select('*')
      .eq('asset_id', asset_id)
      .order('timestamp', { ascending: false })
      .limit(60);

    if (priceError || !priceData || priceData.length === 0) {
      console.error('Price data not found:', priceError);
      return new Response(
        JSON.stringify({ error: 'No price data available for analysis' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI insight
    const result = await generateInsight(asset, priceData, user_id);

    console.log(`Successfully generated insight for ${asset.symbol}`);

    return new Response(
      JSON.stringify({
        success: true,
        asset_symbol: asset.symbol,
        insight_type: result.insight_type,
        confidence_score: result.confidence_score,
        content: result.insight
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-ai-insights function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});