
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

// Função para coletar notícias do NewsAPI
async function collectNewsAPIData(query: string) {
  const apiKey = Deno.env.get('NEWSAPI_KEY');
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&apiKey=${apiKey}&pageSize=20`
    );
    const data = await response.json();
    
    return data.articles?.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      source: article.source?.name || 'NewsAPI',
      author: article.author,
      published_at: article.publishedAt
    })) || [];
  } catch (error) {
    console.error('NewsAPI error:', error);
    return [];
  }
}

// Função para coletar notícias do Marketaux
async function collectMarketauxData(symbols: string[]) {
  const apiKey = Deno.env.get('MARKETAUX_API_KEY');
  if (!apiKey) return [];

  try {
    const symbolsQuery = symbols.join(',');
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=${symbolsQuery}&filter_entities=true&language=en&api_token=${apiKey}&limit=50`
    );
    const data = await response.json();
    
    return data.data?.map((article: any) => ({
      title: article.title,
      description: article.description,
      content: article.snippet,
      url: article.url,
      source: article.source,
      author: null,
      published_at: article.published_at,
      entities: article.entities
    })) || [];
  } catch (error) {
    console.error('Marketaux API error:', error);
    return [];
  }
}

// Função para analisar sentimento usando OpenAI
async function analyzeSentiment(text: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey || !text) return null;

  try {
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
            content: 'Analyze the sentiment of this financial news. Return only a number between -1 (very negative) and 1 (very positive), and rate the potential market impact from 0 to 1.'
          },
          {
            role: 'user',
            content: `Title: ${text.substring(0, 500)}`
          }
        ],
        max_tokens: 50,
        temperature: 0.1
      }),
    });

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    // Parse the response to extract sentiment and impact scores
    const numbers = result.match(/-?\d+\.?\d*/g);
    if (numbers && numbers.length >= 2) {
      return {
        sentiment_score: parseFloat(numbers[0]),
        impact_score: parseFloat(numbers[1])
      };
    }
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting news collection...');

    // Buscar todos os ativos ativos
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('is_active', true);

    if (assetsError) {
      console.error('Error fetching assets:', assetsError);
      throw assetsError;
    }

    let totalArticles = 0;

    // Coletar notícias por tipo de ativo
    const cryptoSymbols = assets?.filter(a => a.asset_type === 'crypto').map(a => a.symbol) || [];
    const stockSymbols = assets?.filter(a => a.asset_type === 'stock').map(a => a.symbol) || [];

    // Coletar notícias gerais de cripto e mercado
    const generalQueries = [
      'cryptocurrency market',
      'bitcoin price',
      'stock market news',
      'financial markets'
    ];

    let allArticles: any[] = [];

    // Coletar do Marketaux
    if (cryptoSymbols.length > 0) {
      const marketauxCrypto = await collectMarketauxData(cryptoSymbols);
      allArticles = [...allArticles, ...marketauxCrypto];
    }

    if (stockSymbols.length > 0) {
      const marketauxStocks = await collectMarketauxData(stockSymbols);
      allArticles = [...allArticles, ...marketauxStocks];
    }

    // Coletar do NewsAPI
    for (const query of generalQueries) {
      const newsApiArticles = await collectNewsAPIData(query);
      allArticles = [...allArticles, ...newsApiArticles];
      
      // Delay entre requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Processar e salvar artigos
    for (const article of allArticles) {
      try {
        // Verificar se o artigo já existe
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (existing) continue; // Skip se já existe

        // Analisar sentimento
        const sentiment = await analyzeSentiment(article.title + ' ' + (article.description || ''));

        // Tentar associar a um ativo
        let assetId = null;
        const articleText = (article.title + ' ' + (article.description || '')).toLowerCase();
        
        for (const asset of assets || []) {
          if (articleText.includes(asset.symbol.toLowerCase()) || 
              articleText.includes(asset.name.toLowerCase())) {
            assetId = asset.id;
            break;
          }
        }

        // Salvar artigo
        const { error } = await supabase
          .from('news_articles')
          .insert({
            asset_id: assetId,
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            source: article.source,
            author: article.author,
            published_at: article.published_at,
            sentiment_score: sentiment?.sentiment_score,
            impact_score: sentiment?.impact_score,
            metadata: {
              entities: article.entities || null
            }
          });

        if (error) {
          console.error('Error saving article:', error);
        } else {
          totalArticles++;
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error('Error processing article:', error);
      }
    }

    console.log(`News collection completed. Saved ${totalArticles} new articles.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Collected and processed ${totalArticles} news articles`,
        total_articles: totalArticles
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in collect-news function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
