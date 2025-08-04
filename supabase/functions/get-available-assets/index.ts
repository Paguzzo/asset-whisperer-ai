import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Listas de ativos populares por tipo
const CRYPTO_ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "ALGO", name: "Algorand" },
  { symbol: "VET", name: "VeChain" },
  { symbol: "FIL", name: "Filecoin" }
];

const US_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "HD", name: "Home Depot Inc." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "BAC", name: "Bank of America Corp." }
];

const BRAZILIAN_STOCKS = [
  { symbol: "PETR4", name: "Petróleo Brasileiro S.A." },
  { symbol: "VALE3", name: "Vale S.A." },
  { symbol: "ITUB4", name: "Itaú Unibanco Holding S.A." },
  { symbol: "BBDC4", name: "Banco Bradesco S.A." },
  { symbol: "ABEV3", name: "Ambev S.A." },
  { symbol: "WEGE3", name: "WEG S.A." },
  { symbol: "RENT3", name: "Localiza Rent a Car S.A." },
  { symbol: "LREN3", name: "Lojas Renner S.A." },
  { symbol: "MGLU3", name: "Magazine Luiza S.A." },
  { symbol: "VVAR3", name: "Via S.A." },
  { symbol: "JBSS3", name: "JBS S.A." },
  { symbol: "SUZB3", name: "Suzano S.A." },
  { symbol: "CCRO3", name: "CCR S.A." },
  { symbol: "GGBR4", name: "Gerdau S.A." },
  { symbol: "RADL3", name: "Raia Drogasil S.A." }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Pegar dados do body para POST ou da query para GET
    let assetType: string | null = null;
    let search = '';

    if (req.method === 'POST') {
      const body = await req.json();
      assetType = body.type;
      search = body.search?.toLowerCase() || '';
    } else {
      assetType = url.searchParams.get('type');
      search = url.searchParams.get('search')?.toLowerCase() || '';
    }

    let assets: { symbol: string; name: string }[] = [];

    switch (assetType) {
      case 'crypto':
        assets = CRYPTO_ASSETS;
        break;
      case 'us_stock':
        assets = US_STOCKS;
        break;
      case 'brazilian_stock':
        assets = BRAZILIAN_STOCKS;
        break;
      default:
        assets = [...CRYPTO_ASSETS, ...US_STOCKS, ...BRAZILIAN_STOCKS];
    }

    // Filtrar por busca se fornecida
    if (search) {
      assets = assets.filter(asset => 
        asset.symbol.toLowerCase().includes(search) || 
        asset.name.toLowerCase().includes(search)
      );
    }

    return new Response(JSON.stringify(assets), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching assets:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});