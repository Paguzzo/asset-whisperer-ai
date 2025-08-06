
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertData {
  id: string;
  user_id: string;
  asset_id: string;
  alert_type: string;
  target_price: number;
  condition: string;
  pre_alert_percentage: number;
  is_active: boolean;
  is_triggered: boolean;
}

interface PriceData {
  price: number;
  asset_id: string;
  timestamp: string;
}

interface Asset {
  symbol: string;
  name: string;
}

interface WhatsAppConfig {
  phone_number: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  is_verified: boolean;
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar alertas ativos
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('price_alerts')
      .select('*')
      .eq('is_active', true)
      .eq('is_triggered', false);

    if (alertsError) {
      throw alertsError;
    }

    console.log(`Processando ${alerts?.length || 0} alertas`);

    for (const alert of alerts || []) {
      await processAlert(supabaseClient, alert);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: alerts?.length || 0,
        message: 'Alertas processados com sucesso' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao processar alertas:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function processAlert(supabaseClient: any, alert: AlertData) {
  try {
    // Buscar o preço atual do ativo
    const { data: priceData, error: priceError } = await supabaseClient
      .from('price_data')
      .select('price, timestamp')
      .eq('asset_id', alert.asset_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (priceError || !priceData) {
      console.log(`Sem dados de preço para o ativo ${alert.asset_id}`);
      return;
    }

    const currentPrice = priceData.price;
    const targetPrice = alert.target_price;
    const preAlertPercentage = alert.pre_alert_percentage || 5;

    // Calcular se deve disparar alerta ou pré-alerta
    const shouldTrigger = checkTriggerCondition(currentPrice, targetPrice, alert.condition);
    const shouldPreAlert = checkPreAlertCondition(
      currentPrice, 
      targetPrice, 
      alert.condition, 
      preAlertPercentage
    );

    if (shouldTrigger) {
      await triggerAlert(supabaseClient, alert, currentPrice, 'alert');
    } else if (shouldPreAlert) {
      // Verificar se já foi enviado pré-alerta nas últimas 4 horas
      const { data: recentAlerts } = await supabaseClient
        .from('alert_logs')
        .select('*')
        .eq('alert_id', alert.id)
        .eq('alert_type', 'pre_alert')
        .gte('sent_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString());

      if (!recentAlerts?.length) {
        await triggerAlert(supabaseClient, alert, currentPrice, 'pre_alert');
      }
    }

  } catch (error) {
    console.error(`Erro ao processar alerta ${alert.id}:`, error);
  }
}

function checkTriggerCondition(currentPrice: number, targetPrice: number, condition: string): boolean {
  if (condition === 'above') {
    return currentPrice >= targetPrice;
  } else if (condition === 'below') {
    return currentPrice <= targetPrice;
  }
  return false;
}

function checkPreAlertCondition(
  currentPrice: number, 
  targetPrice: number, 
  condition: string, 
  percentage: number
): boolean {
  const threshold = targetPrice * (percentage / 100);
  
  if (condition === 'above') {
    return currentPrice >= (targetPrice - threshold) && currentPrice < targetPrice;
  } else if (condition === 'below') {
    return currentPrice <= (targetPrice + threshold) && currentPrice > targetPrice;
  }
  return false;
}

async function triggerAlert(
  supabaseClient: any, 
  alert: AlertData, 
  currentPrice: number, 
  alertType: string
) {
  try {
    // Buscar informações do ativo
    const { data: asset } = await supabaseClient
      .from('assets')
      .select('symbol, name')
      .eq('id', alert.asset_id)
      .single();

    if (!asset) {
      throw new Error('Ativo não encontrado');
    }

    // Buscar configuração do WhatsApp do usuário
    const { data: whatsappConfig } = await supabaseClient
      .from('whatsapp_configs')
      .select('*')
      .eq('user_id', alert.user_id)
      .eq('is_active', true)
      .single();

    if (!whatsappConfig || !whatsappConfig.is_verified) {
      console.log(`WhatsApp não configurado para usuário ${alert.user_id}`);
      return;
    }

    // Gerar mensagem
    const message = generateAlertMessage(asset, alert, currentPrice, alertType);

    // Enviar WhatsApp
    const whatsappStatus = await sendWhatsAppMessage(whatsappConfig, message);

    // Registrar log do alerta
    await supabaseClient
      .from('alert_logs')
      .insert({
        user_id: alert.user_id,
        asset_id: alert.asset_id,
        alert_id: alert.id,
        alert_type: alertType,
        message,
        whatsapp_status,
        metadata: {
          current_price: currentPrice,
          target_price: alert.target_price,
          condition: alert.condition
        }
      });

    // Se for alerta principal, marcar como disparado
    if (alertType === 'alert') {
      await supabaseClient
        .from('price_alerts')
        .update({ 
          is_triggered: true, 
          triggered_at: new Date().toISOString() 
        })
        .eq('id', alert.id);
    }

    console.log(`Alerta enviado: ${alertType} para ${asset.symbol}`);

  } catch (error) {
    console.error('Erro ao disparar alerta:', error);
  }
}

function generateAlertMessage(
  asset: Asset, 
  alert: AlertData, 
  currentPrice: number, 
  alertType: string
): string {
  const formatPrice = (price: number) => price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

  const alertTypeNames = {
    'price_target': 'Meta de Preço',
    'stop_loss': 'Stop Loss',
    'take_profit': 'Take Profit',
    'support_resistance': 'Suporte/Resistência'
  };

  if (alertType === 'pre_alert') {
    const percentage = alert.pre_alert_percentage;
    return `🔔 *PRÉ-ALERTA* 🔔\n\n` +
           `📊 *${asset.symbol}* (${asset.name})\n` +
           `💰 Preço atual: ${formatPrice(currentPrice)}\n` +
           `🎯 Meta: ${formatPrice(alert.target_price)}\n` +
           `⚠️ Está a ${percentage}% da sua meta!\n\n` +
           `Tipo: ${alertTypeNames[alert.alert_type] || alert.alert_type}`;
  } else {
    const emoji = alert.condition === 'above' ? '🚀' : '📉';
    return `${emoji} *ALERTA DISPARADO* ${emoji}\n\n` +
           `📊 *${asset.symbol}* (${asset.name})\n` +
           `💰 Preço atual: ${formatPrice(currentPrice)}\n` +
           `🎯 Meta atingida: ${formatPrice(alert.target_price)}\n` +
           `📈 Condição: ${alert.condition === 'above' ? 'Acima' : 'Abaixo'}\n\n` +
           `Tipo: ${alertTypeNames[alert.alert_type] || alert.alert_type}`;
  }
}

async function sendWhatsAppMessage(config: WhatsAppConfig, message: string): Promise<string> {
  try {
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.twilio_account_sid}/Messages.json`;
    
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.twilio_account_sid}:${config.twilio_auth_token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886', // Twilio Sandbox number
        To: `whatsapp:${config.phone_number}`,
        Body: message,
      }),
    });

    if (response.ok) {
      return 'sent';
    } else {
      const error = await response.text();
      console.error('Erro Twilio:', error);
      return 'failed';
    }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return 'failed';
  }
}
