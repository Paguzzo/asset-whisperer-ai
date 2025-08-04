import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

interface PriceData {
  symbol: string
  price: number
  volume?: number
  change_24h?: number
  change_percent_24h?: number
  market_cap?: number
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Yahoo Finance API (free tier)
async function fetchYahooFinanceData(symbol: string): Promise<PriceData | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    
    if (!response.ok) {
      console.log(`Yahoo Finance API error for ${symbol}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    const result = data.chart?.result?.[0]
    
    if (!result) return null
    
    const quote = result.indicators?.quote?.[0]
    const meta = result.meta
    
    return {
      symbol: symbol.toUpperCase(),
      price: meta.regularMarketPrice || quote.close?.[quote.close.length - 1] || 0,
      volume: quote.volume?.[quote.volume.length - 1],
      change_24h: meta.regularMarketPrice - meta.previousClose,
      change_percent_24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      market_cap: meta.regularMarketPrice * meta.sharesOutstanding
    }
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error)
    return null
  }
}

// Brapi for Brazilian stocks
async function fetchBrapiData(symbol: string): Promise<PriceData | null> {
  try {
    const response = await fetch(`https://brapi.dev/api/quote/${symbol}`)
    
    if (!response.ok) {
      console.log(`Brapi API error for ${symbol}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    const result = data.results?.[0]
    
    if (!result) return null
    
    return {
      symbol: result.symbol,
      price: result.regularMarketPrice,
      volume: result.regularMarketVolume,
      change_24h: result.regularMarketChange,
      change_percent_24h: result.regularMarketChangePercent,
      market_cap: result.marketCap
    }
  } catch (error) {
    console.error(`Error fetching Brapi data for ${symbol}:`, error)
    return null
  }
}

// Binance for crypto
async function fetchBinanceData(symbol: string): Promise<PriceData | null> {
  try {
    // For crypto, we need to add USDT if not present
    const binanceSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`
    
    const [tickerResponse, statsResponse] = await Promise.all([
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`),
      fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`)
    ])
    
    if (!tickerResponse.ok || !statsResponse.ok) {
      console.log(`Binance API error for ${symbol}: ticker=${tickerResponse.status}, stats=${statsResponse.status}`)
      return null
    }
    
    const ticker = await tickerResponse.json()
    const stats = await statsResponse.json()
    
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(ticker.price),
      volume: parseFloat(stats.volume),
      change_24h: parseFloat(stats.priceChange),
      change_percent_24h: parseFloat(stats.priceChangePercent)
    }
  } catch (error) {
    console.error(`Error fetching Binance data for ${symbol}:`, error)
    return null
  }
}

async function collectPriceData(asset: any, intervalType: string) {
  let priceData: PriceData | null = null
  
  console.log(`Fetching data for ${asset.symbol} (${asset.asset_type})`)
  
  // Choose API based on asset type
  switch (asset.asset_type) {
    case 'brazilian_stock':
      priceData = await fetchBrapiData(asset.symbol)
      break
    case 'us_stock':
      priceData = await fetchYahooFinanceData(asset.symbol)
      break
    case 'crypto':
      priceData = await fetchBinanceData(asset.symbol)
      break
  }
  
  if (!priceData) {
    console.log(`No price data obtained for ${asset.symbol}`)
    return null
  }
  
  console.log(`Price data for ${asset.symbol}: $${priceData.price}`)
  
  // Store in database
  const { error } = await supabase
    .from('price_data')
    .insert({
      asset_id: asset.id,
      price: priceData.price,
      volume: priceData.volume,
      market_cap: priceData.market_cap,
      change_24h: priceData.change_24h,
      change_percent_24h: priceData.change_percent_24h,
      interval_type: intervalType,
      timestamp: new Date().toISOString(),
      source: asset.asset_type === 'brazilian_stock' ? 'brapi' : 
              asset.asset_type === 'us_stock' ? 'yahoo' : 'binance',
      raw_data: priceData
    })
  
  if (error) {
    console.error('Error storing price data:', error)
    return null
  }
  
  console.log(`Successfully stored price data for ${asset.symbol}`)
  return priceData
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const url = new URL(req.url)
    const intervalType = url.searchParams.get('interval') || 'daily'
    
    console.log(`Starting market data collection for interval: ${intervalType}`)
    
    // Get all active assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('is_active', true)
    
    if (assetsError) {
      console.error('Error fetching assets:', assetsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch assets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log(`Found ${assets?.length || 0} active assets`)
    
    const results = []
    let successCount = 0
    
    for (const asset of assets || []) {
      console.log(`Processing asset: ${asset.symbol} (${asset.asset_type})`)
      
      try {
        const priceData = await collectPriceData(asset, intervalType)
        if (priceData) {
          results.push({ asset: asset.symbol, success: true, price: priceData.price })
          successCount++
        } else {
          results.push({ asset: asset.symbol, success: false, error: 'No data collected' })
        }
      } catch (error) {
        console.error(`Error collecting data for ${asset.symbol}:`, error)
        results.push({ asset: asset.symbol, success: false, error: error.message })
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log(`Collection completed. Successfully collected data for ${successCount} out of ${assets?.length || 0} assets`)
    
    return new Response(
      JSON.stringify({
        success: true,
        interval: intervalType,
        collected: successCount,
        total: assets?.length || 0,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in market data collection:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})