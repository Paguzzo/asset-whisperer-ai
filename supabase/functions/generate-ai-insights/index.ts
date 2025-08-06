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

interface AdvancedTechnicalIndicators {
  sma9: number;
  sma21: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  stochasticK: number;
  stochasticD: number;
  signals: string[];
  trend: string;
  confidenceFactors: string[];
  overallConfidence: number;
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

// Calculate Exponential Moving Average
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[0] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices[prices.length - 1]; // Start with the oldest price
  
  for (let i = prices.length - 2; i >= 0; i--) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

// Calculate RSI with improved precision
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i-1] - prices[i];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Smooth the averages for more recent periods
  for (let i = period + 1; i < Math.min(prices.length, period + 10); i++) {
    const change = prices[i-1] - prices[i];
    if (change > 0) {
      avgGain = ((avgGain * (period - 1)) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
    }
  }
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate MACD
function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // For simplicity, using a 9-period EMA of MACD as signal line
  const macdSignal = macd * 0.2; // Simplified calculation
  const histogram = macd - macdSignal;
  
  return { macd, signal: macdSignal, histogram };
}

// Calculate Bollinger Bands
function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } {
  const middle = calculateSMA(prices, period);
  
  if (prices.length < period) {
    return { upper: middle, middle, lower: middle };
  }
  
  // Calculate standard deviation
  const variance = prices.slice(0, period).reduce((sum, price) => {
    return sum + Math.pow(price - middle, 2);
  }, 0) / period;
  
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: middle + (standardDeviation * stdDev),
    middle,
    lower: middle - (standardDeviation * stdDev)
  };
}

// Calculate Stochastic Oscillator
function calculateStochastic(prices: number[], period: number = 14): { k: number; d: number } {
  if (prices.length < period) return { k: 50, d: 50 };
  
  const recentPrices = prices.slice(0, period);
  const highestHigh = Math.max(...recentPrices);
  const lowestLow = Math.min(...recentPrices);
  const currentPrice = prices[0];
  
  const k = ((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  // Simplified %D calculation (3-period SMA of %K)
  const d = k * 0.5 + 25; // Simplified calculation
  
  return { k, d };
}

// Advanced technical analysis with comprehensive indicators
function calculateAdvancedTechnicalIndicators(priceData: PriceData[]): AdvancedTechnicalIndicators {
  const prices = priceData.map(p => p.price);
  const volumes = priceData.map(p => p.volume || 0);
  
  // Calculate all indicators
  const sma9 = calculateSMA(prices, 9);
  const sma21 = calculateSMA(prices, 21);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const rsi = calculateRSI(prices);
  const macdData = calculateMACD(prices);
  const bollinger = calculateBollingerBands(prices);
  const stochastic = calculateStochastic(prices);
  
  const currentPrice = prices[0];
  const signals: string[] = [];
  const confidenceFactors: string[] = [];
  
  // Trend Analysis
  let trendScore = 0;
  let trend = 'Indefinido';
  
  // Moving Average Analysis
  if (sma9 > sma21 && sma21 > sma50) {
    signals.push('🔵 Alinhamento de médias em ALTA (MM9 > MM21 > MM50)');
    confidenceFactors.push('Médias móveis alinhadas para alta');
    trendScore += 2;
  } else if (sma9 < sma21 && sma21 < sma50) {
    signals.push('🔴 Alinhamento de médias em BAIXA (MM9 < MM21 < MM50)');
    confidenceFactors.push('Médias móveis alinhadas para baixa');
    trendScore -= 2;
  } else {
    signals.push('🟡 Médias móveis em processo de realinhamento');
  }
  
  // Price position relative to moving averages
  const priceAboveMA = [];
  if (currentPrice > sma9) priceAboveMA.push('MM9');
  if (currentPrice > sma21) priceAboveMA.push('MM21');
  if (currentPrice > sma50) priceAboveMA.push('MM50');
  
  if (priceAboveMA.length === 3) {
    signals.push('✅ Preço acima de TODAS as médias móveis');
    confidenceFactors.push('Preço em posição de força');
    trendScore += 1;
  } else if (priceAboveMA.length === 0) {
    signals.push('❌ Preço abaixo de TODAS as médias móveis');
    confidenceFactors.push('Preço em posição de fraqueza');
    trendScore -= 1;
  } else {
    signals.push(`⚖️ Preço acima de ${priceAboveMA.join(', ')}`);
  }
  
  // RSI Analysis
  if (rsi > 70) {
    signals.push(`📈 RSI em zona de SOBRECOMPRA (${rsi.toFixed(1)})`);
    trendScore -= 0.5;
  } else if (rsi < 30) {
    signals.push(`📉 RSI em zona de SOBREVENDA (${rsi.toFixed(1)})`);
    trendScore += 0.5;
  } else if (rsi > 50) {
    signals.push(`💪 RSI indica força compradora (${rsi.toFixed(1)})`);
    confidenceFactors.push('RSI confirma força');
    trendScore += 0.5;
  } else {
    signals.push(`⬇️ RSI indica pressão vendedora (${rsi.toFixed(1)})`);
    trendScore -= 0.5;
  }
  
  // MACD Analysis
  if (macdData.macd > macdData.signal) {
    signals.push('🟢 MACD acima da linha de sinal (momentum positivo)');
    confidenceFactors.push('MACD confirma momentum positivo');
    trendScore += 1;
  } else {
    signals.push('🔴 MACD abaixo da linha de sinal (momentum negativo)');
    trendScore -= 1;
  }
  
  // Bollinger Bands Analysis
  const priceToBollingerRatio = (currentPrice - bollinger.lower) / (bollinger.upper - bollinger.lower);
  if (priceToBollingerRatio > 0.8) {
    signals.push('🎯 Preço próximo ao topo da Banda de Bollinger');
    trendScore -= 0.5;
  } else if (priceToBollingerRatio < 0.2) {
    signals.push('🎯 Preço próximo ao fundo da Banda de Bollinger');
    trendScore += 0.5;
  } else {
    signals.push('📊 Preço na faixa média das Bandas de Bollinger');
    confidenceFactors.push('Preço em zona neutra');
  }
  
  // Stochastic Analysis
  if (stochastic.k > 80) {
    signals.push(`⚡ Estocástico em zona de sobrecompra (%K: ${stochastic.k.toFixed(1)})`);
    trendScore -= 0.5;
  } else if (stochastic.k < 20) {
    signals.push(`⚡ Estocástico em zona de sobrevenda (%K: ${stochastic.k.toFixed(1)})`);
    trendScore += 0.5;
  }
  
  // Volume Analysis
  const avgVolume = volumes.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  const currentVolume = volumes[0] || 0;
  if (currentVolume > avgVolume * 1.5) {
    signals.push('📊 Volume ELEVADO - confirma movimento');
    confidenceFactors.push('Volume confirma o movimento');
    trendScore += 0.5;
  } else if (currentVolume < avgVolume * 0.5) {
    signals.push('📊 Volume BAIXO - movimento sem convicção');
    trendScore -= 0.3;
  }
  
  // Determine overall trend and confidence
  if (trendScore >= 2) {
    trend = 'ALTA FORTE';
  } else if (trendScore >= 1) {
    trend = 'ALTA';
  } else if (trendScore > -1) {
    trend = 'LATERAL';
  } else if (trendScore >= -2) {
    trend = 'BAIXA';
  } else {
    trend = 'BAIXA FORTE';
  }
  
  // Calculate confidence based on convergence of indicators
  let overallConfidence = 0.5; // Base confidence
  
  // Add confidence based on factors
  if (confidenceFactors.length >= 4) {
    overallConfidence = Math.min(0.95, 0.7 + (confidenceFactors.length * 0.05));
  } else if (confidenceFactors.length >= 2) {
    overallConfidence = 0.6 + (confidenceFactors.length * 0.05);
  } else {
    overallConfidence = Math.max(0.3, 0.5 + (confidenceFactors.length * 0.1));
  }
  
  // Reduce confidence if there are conflicting signals
  const conflictingSignals = signals.filter(s => s.includes('realinhamento') || s.includes('sem convicção')).length;
  if (conflictingSignals > 0) {
    overallConfidence *= (1 - conflictingSignals * 0.1);
  }
  
  return {
    sma9,
    sma21,
    sma50,
    ema12,
    ema26,
    rsi,
    macd: macdData.macd,
    macdSignal: macdData.signal,
    macdHistogram: macdData.histogram,
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    stochasticK: stochastic.k,
    stochasticD: stochastic.d,
    signals,
    trend,
    confidenceFactors,
    overallConfidence
  };
}

async function generateInsight(asset: Asset, priceData: PriceData[], userId: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Calculate advanced technical indicators
  const technicalIndicators = calculateAdvancedTechnicalIndicators(priceData);
  
  // Prepare market data context
  const latestPrice = priceData[0];
  const previousPrices = priceData.slice(1, 10);
  
  const priceHistory = previousPrices.map(p => ({
    price: p.price,
    change: p.change_percent_24h,
    timestamp: p.timestamp
  }));

  const prompt = `
Você é um analista técnico EXPERIENTE. Analise os dados do ativo ${asset.symbol} (${asset.name}) com base nos INDICADORES TÉCNICOS CALCULADOS.

DADOS ATUAIS:
- Preço: $${latestPrice.price}
- Variação 24h: ${latestPrice.change_percent_24h}%
- Volume: ${latestPrice.volume || 'N/A'}
- Tipo: ${asset.asset_type}

INDICADORES TÉCNICOS CALCULADOS:
📈 MÉDIAS MÓVEIS:
- MM9: $${technicalIndicators.sma9.toFixed(4)}
- MM21: $${technicalIndicators.sma21.toFixed(4)}
- MM50: $${technicalIndicators.sma50.toFixed(4)}
- EMA12: $${technicalIndicators.ema12.toFixed(4)}
- EMA26: $${technicalIndicators.ema26.toFixed(4)}

📊 OSCILADORES:
- RSI(14): ${technicalIndicators.rsi.toFixed(2)}
- Estocástico %K: ${technicalIndicators.stochasticK.toFixed(2)}
- Estocástico %D: ${technicalIndicators.stochasticD.toFixed(2)}

📈 MACD:
- MACD: ${technicalIndicators.macd.toFixed(4)}
- Sinal: ${technicalIndicators.macdSignal.toFixed(4)}
- Histograma: ${technicalIndicators.macdHistogram.toFixed(4)}

🎯 BANDAS DE BOLLINGER:
- Superior: $${technicalIndicators.bollingerUpper.toFixed(4)}
- Média: $${technicalIndicators.bollingerMiddle.toFixed(4)}
- Inferior: $${technicalIndicators.bollingerLower.toFixed(4)}

🔍 SINAIS DETECTADOS:
${technicalIndicators.signals.map(signal => `${signal}`).join('\n')}

💪 FATORES DE CONFIANÇA:
${technicalIndicators.confidenceFactors.map(factor => `✓ ${factor}`).join('\n')}

📊 TENDÊNCIA IDENTIFICADA: ${technicalIndicators.trend}

Com base nesses indicadores CALCULADOS, forneça:

**1. ANÁLISE DE TENDÊNCIA** (confirme com dados):
- Direção confirmada pelos indicadores
- Força da tendência baseada na convergência

**2. SUPORTE E RESISTÊNCIA TÉCNICOS**:
- Níveis baseados nas médias móveis
- Bandas de Bollinger como referência

**3. RECOMENDAÇÃO FUNDAMENTADA**:
- COMPRAR/VENDER/AGUARDAR baseado na convergência dos indicadores
- Pontos de entrada/saída técnicos

**4. GESTÃO DE RISCO**:
- Stop-loss técnico sugerido
- Take-profit baseado em resistências

**5. CENÁRIO DE CONFIANÇA**:
- Confiança na análise: ${Math.round(technicalIndicators.overallConfidence * 100)}%
- Próximos níveis a observar

Seja TÉCNICO, PRECISO e use os dados calculados. Evite especulações.
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
          content: 'Você é um analista técnico sênior com 15+ anos de experiência. Use APENAS os indicadores técnicos fornecidos para suas análises. Seja preciso, técnico e fundamentado em dados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const insight = data.choices[0].message.content;

  // Use the calculated confidence score
  const confidenceScore = technicalIndicators.overallConfidence;

  // Determine insight type based on trend and indicators
  let insightType = 'technical_analysis';
  if (technicalIndicators.trend.includes('ALTA')) insightType = 'buy_signal';
  else if (technicalIndicators.trend.includes('BAIXA')) insightType = 'sell_signal';
  else insightType = 'hold_signal';

  // Store insight in database
  const { error: insertError } = await supabase
    .from('ai_insights')
    .insert({
      user_id: userId,
      asset_id: asset.id,
      title: `Análise Técnica Avançada - ${asset.symbol}`,
      content: insight,
      insight_type: insightType,
      confidence_score: confidenceScore,
      metadata: {
        current_price: latestPrice.price,
        change_24h: latestPrice.change_percent_24h,
        technical_indicators: {
          sma9: technicalIndicators.sma9,
          sma21: technicalIndicators.sma21,
          sma50: technicalIndicators.sma50,
          rsi: technicalIndicators.rsi,
          macd: technicalIndicators.macd,
          trend: technicalIndicators.trend,
          confidence_factors_count: technicalIndicators.confidenceFactors.length,
          signals_count: technicalIndicators.signals.length
        },
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

    // Get recent price data for the asset (increased to 100 for advanced technical analysis)
    const { data: priceData, error: priceError } = await supabase
      .from('price_data')
      .select('*')
      .eq('asset_id', asset_id)
      .order('timestamp', { ascending: false })
      .limit(100);

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
