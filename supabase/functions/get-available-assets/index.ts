
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Top 100 criptomoedas por capitalização de mercado
const CRYPTO_ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDT", name: "Tether" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "USDC", name: "USD Coin" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "STETH", name: "Lido Staked ETH" },
  { symbol: "TON", name: "Toncoin" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "WBTC", name: "Wrapped Bitcoin" },
  { symbol: "TRX", name: "TRON" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "ICP", name: "Internet Computer" },
  { symbol: "SHIB", name: "Shiba Inu" },
  { symbol: "NEAR", name: "NEAR Protocol" },
  { symbol: "UNI", name: "Uniswap" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "APT", name: "Aptos" },
  { symbol: "BCH", name: "Bitcoin Cash" },
  { symbol: "FET", name: "Fetch.AI" },
  { symbol: "STX", name: "Stacks" },
  { symbol: "HBAR", name: "Hedera" },
  { symbol: "CRO", name: "Cronos" },
  { symbol: "VET", name: "VeChain" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "FIL", name: "Filecoin" },
  { symbol: "INJ", name: "Injective" },
  { symbol: "MNT", name: "Mantle" },
  { symbol: "IMX", name: "Immutable X" },
  { symbol: "OP", name: "Optimism" },
  { symbol: "ARB", name: "Arbitrum" },
  { symbol: "ALGO", name: "Algorand" },
  { symbol: "THETA", name: "Theta Network" },
  { symbol: "LDO", name: "Lido DAO" },
  { symbol: "AAVE", name: "Aave" },
  { symbol: "GRT", name: "The Graph" },
  { symbol: "MKR", name: "Maker" },
  { symbol: "SAND", name: "The Sandbox" },
  { symbol: "AXS", name: "Axie Infinity" },
  { symbol: "MANA", name: "Decentraland" },
  { symbol: "FLOW", name: "Flow" },
  { symbol: "XTZ", name: "Tezos" },
  { symbol: "EGLD", name: "MultiversX" },
  { symbol: "KLAY", name: "Klaytn" },
  { symbol: "CHZ", name: "Chiliz" },
  { symbol: "SNX", name: "Synthetix" },
  { symbol: "COMP", name: "Compound" },
  { symbol: "YFI", name: "yearn.finance" },
  { symbol: "ZEC", name: "Zcash" },
  { symbol: "DASH", name: "Dash" },
  { symbol: "ETC", name: "Ethereum Classic" },
  { symbol: "XMR", name: "Monero" },
  { symbol: "NEO", name: "Neo" },
  { symbol: "QTUM", name: "Qtum" },
  { symbol: "BAT", name: "Basic Attention Token" },
  { symbol: "ZIL", name: "Zilliqa" },
  { symbol: "ENJ", name: "Enjin Coin" },
  { symbol: "SUSHI", name: "SushiSwap" },
  { symbol: "CRV", name: "Curve DAO Token" },
  { symbol: "REN", name: "Ren" },
  { symbol: "ZRX", name: "0x" },
  { symbol: "OMG", name: "OMG Network" },
  { symbol: "STORJ", name: "Storj" },
  { symbol: "KNC", name: "Kyber Network" },
  { symbol: "REP", name: "Augur" },
  { symbol: "BNT", name: "Bancor" },
  { symbol: "LOOPRING", name: "Loopring" },
  { symbol: "ANT", name: "Aragon" },
  { symbol: "MYST", name: "Mysterium" },
  { symbol: "OCEAN", name: "Ocean Protocol" },
  { symbol: "NMR", name: "Numeraire" },
  { symbol: "RLC", name: "iExec RLC" },
  { symbol: "FUN", name: "FunFair" },
  { symbol: "DNT", name: "district0x" },
  { symbol: "POLY", name: "Polymath" },
  { symbol: "POWR", name: "Power Ledger" },
  { symbol: "REQ", name: "Request Network" },
  { symbol: "WAXP", name: "WAX" },
  { symbol: "ICX", name: "ICON" },
  { symbol: "ONT", name: "Ontology" },
  { symbol: "WAN", name: "Wanchain" },
  { symbol: "IOST", name: "IOST" },
  { symbol: "HOLO", name: "Holo" },
  { symbol: "NANO", name: "Nano" },
  { symbol: "IOTA", name: "IOTA" },
  { symbol: "XEM", name: "NEM" },
  { symbol: "LSK", name: "Lisk" },
  { symbol: "STEEM", name: "Steem" },
  { symbol: "WAVES", name: "Waves" },
  { symbol: "DENT", name: "Dent" },
  { symbol: "SC", name: "Siacoin" },
  { symbol: "DGB", name: "DigiByte" },
  { symbol: "RVN", name: "Ravencoin" },
  { symbol: "ZEN", name: "Horizen" },
  { symbol: "DCR", name: "Decred" },
  { symbol: "BTS", name: "BitShares" },
  { symbol: "ARDR", name: "Ardor" },
  { symbol: "STRAX", name: "Stratis" },
  { symbol: "KMD", name: "Komodo" },
  { symbol: "XLM", name: "Stellar" }
];

// Top 50 maiores ações de tecnologia
const US_TECH_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc. Class A" },
  { symbol: "GOOG", name: "Alphabet Inc. Class C" },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "CRM", name: "Salesforce Inc." },
  { symbol: "ORCL", name: "Oracle Corporation" },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "INTC", name: "Intel Corporation" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc." },
  { symbol: "QCOM", name: "QUALCOMM Incorporated" },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "UBER", name: "Uber Technologies Inc." },
  { symbol: "SNOW", name: "Snowflake Inc." },
  { symbol: "NOW", name: "ServiceNow Inc." },
  { symbol: "SHOP", name: "Shopify Inc." },
  { symbol: "ZOOM", name: "Zoom Video Communications" },
  { symbol: "PLTR", name: "Palantir Technologies Inc." },
  { symbol: "SQ", name: "Block Inc." },
  { symbol: "TWLO", name: "Twilio Inc." },
  { symbol: "ROKU", name: "Roku Inc." },
  { symbol: "SPOT", name: "Spotify Technology S.A." },
  { symbol: "DDOG", name: "Datadog Inc." },
  { symbol: "CRWD", name: "CrowdStrike Holdings Inc." },
  { symbol: "OKTA", name: "Okta Inc." },
  { symbol: "ZS", name: "Zscaler Inc." },
  { symbol: "DOCU", name: "DocuSign Inc." },
  { symbol: "SPLK", name: "Splunk Inc." },
  { symbol: "TEAM", name: "Atlassian Corporation" },
  { symbol: "WDAY", name: "Workday Inc." },
  { symbol: "VEEV", name: "Veeva Systems Inc." },
  { symbol: "PANW", name: "Palo Alto Networks Inc." },
  { symbol: "FTNT", name: "Fortinet Inc." },
  { symbol: "NET", name: "Cloudflare Inc." },
  { symbol: "MDB", name: "MongoDB Inc." },
  { symbol: "ZM", name: "Zoom Video Communications" },
  { symbol: "PINS", name: "Pinterest Inc." },
  { symbol: "SNAP", name: "Snap Inc." },
  { symbol: "LYFT", name: "Lyft Inc." },
  { symbol: "DASH", name: "DoorDash Inc." },
  { symbol: "ABNB", name: "Airbnb Inc." },
  { symbol: "RBLX", name: "Roblox Corporation" },
  { symbol: "U", name: "Unity Software Inc." },
  { symbol: "PATH", name: "UiPath Inc." },
  { symbol: "COIN", name: "Coinbase Global Inc." }
];

// Ações brasileiras mantidas como estavam
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
        assets = US_TECH_STOCKS;
        break;
      case 'brazilian_stock':
        assets = BRAZILIAN_STOCKS;
        break;
      default:
        assets = [...CRYPTO_ASSETS, ...US_TECH_STOCKS, ...BRAZILIAN_STOCKS];
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
