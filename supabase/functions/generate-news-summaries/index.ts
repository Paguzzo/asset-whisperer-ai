
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

async function generateSummary(articles: any[], summaryType: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Preparar contexto das notícias
  const articlesContext = articles.slice(0, 20).map((article, index) => 
    `${index + 1}. ${article.title}\n${article.description || ''}\nSentiment: ${article.sentiment_score?.toFixed(2) || 'N/A'}\nFonte: ${article.source}\n`
  ).join('\n---\n');

  const timeframeMap = {
    '4h': '4 horas',
    'daily': '24 horas',
    'weekly': '7 dias'
  };

  const prompt = `
Como um analista financeiro experiente, crie um resumo executivo das principais notícias dos últimos ${timeframeMap[summaryType as keyof typeof timeframeMap]} do mercado financeiro.

NOTÍCIAS ANALISADAS:
${articlesContext}

Crie um resumo estruturado incluindo:

**📊 RESUMO EXECUTIVO**
- Principais eventos que impactaram os mercados
- Tom geral do mercado (otimista/pessimista/neutro)

**🔍 DESTAQUES PRINCIPAIS**
- Top 3 notícias mais relevantes
- Impacto esperado nos ativos

**📈 ANÁLISE DE SENTIMENTO**
- Sentimento predominante das notícias
- Setores/ativos com maior atenção

**⚠️ ALERTAS E OPORTUNIDADES**
- Eventos importantes a observar
- Possíveis catalisadores de movimento

**🎯 CONCLUSÃO**
- Visão geral do momento do mercado
- Recomendações de acompanhamento

Seja objetivo, técnico e focado em actionable insights para traders/investidores.
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
          content: 'Você é um analista financeiro sênior especializado em resumir notícias de mercado de forma objetiva e actionable.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function calculateSentimentOverview(articles: any[]) {
  const validSentiments = articles.filter(a => a.sentiment_score !== null);
  
  if (validSentiments.length === 0) {
    return {
      average: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      total: articles.length
    };
  }

  const average = validSentiments.reduce((sum, a) => sum + a.sentiment_score, 0) / validSentiments.length;
  const positive = validSentiments.filter(a => a.sentiment_score > 0.1).length;
  const negative = validSentiments.filter(a => a.sentiment_score < -0.1).length;
  const neutral = validSentiments.length - positive - negative;

  return {
    average: parseFloat(average.toFixed(3)),
    positive,
    negative,
    neutral,
    total: articles.length
  };
}

function extractKeyEvents(articles: any[]) {
  return articles
    .filter(a => a.impact_score && a.impact_score > 0.7)
    .slice(0, 5)
    .map(a => ({
      title: a.title,
      impact_score: a.impact_score,
      sentiment_score: a.sentiment_score,
      source: a.source,
      published_at: a.published_at
    }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summary_type = 'daily' } = await req.json();
    
    console.log(`Generating ${summary_type} news summary...`);

    // Definir período baseado no tipo
    const now = new Date();
    let cutoffTime: Date;
    
    switch (summary_type) {
      case '4h':
        cutoffTime = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default: // daily
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Buscar notícias do período
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .gte('published_at', cutoffTime.toISOString())
      .order('published_at', { ascending: false })
      .limit(50);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      throw articlesError;
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `No articles found for ${summary_type} summary`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar resumo com IA
    const summaryContent = await generateSummary(articles, summary_type);

    // Calcular métricas
    const sentimentOverview = calculateSentimentOverview(articles);
    const keyEvents = extractKeyEvents(articles);

    // Buscar todos os usuários ativos para gerar resumos
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1000); // Ajustar conforme necessário

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    let summariesCreated = 0;

    // Criar resumo para cada usuário
    for (const user of users || []) {
      try {
        const { error: insertError } = await supabase
          .from('news_summaries')
          .insert({
            user_id: user.id,
            summary_type,
            title: `Resumo ${summary_type === '4h' ? '4h' : summary_type === 'daily' ? 'Diário' : 'Semanal'} - ${now.toLocaleDateString('pt-BR')}`,
            content: summaryContent,
            articles_count: articles.length,
            sentiment_overview: sentimentOverview,
            key_events: keyEvents,
            market_impact_analysis: sentimentOverview.average > 0.1 ? 'Positivo' : sentimentOverview.average < -0.1 ? 'Negativo' : 'Neutro'
          });

        if (insertError) {
          console.error(`Error creating summary for user ${user.id}:`, insertError);
        } else {
          summariesCreated++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    }

    console.log(`Generated ${summariesCreated} news summaries of type ${summary_type}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary_type,
        articles_analyzed: articles.length,
        summaries_created: summariesCreated,
        sentiment_overview: sentimentOverview,
        key_events_count: keyEvents.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-news-summaries function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
