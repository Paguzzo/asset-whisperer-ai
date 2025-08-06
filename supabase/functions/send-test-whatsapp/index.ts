
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone_number, twilio_account_sid, twilio_auth_token } = await req.json();

    if (!phone_number || !twilio_account_sid || !twilio_auth_token) {
      throw new Error('Parâmetros obrigatórios não fornecidos');
    }

    // Enviar mensagem de teste via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilio_account_sid}/Messages.json`;
    
    const testMessage = `🤖 *Teste de Configuração* 🤖\n\nSeu WhatsApp foi configurado com sucesso!\n\nAgora você receberá alertas sobre seus investimentos.\n\n📈 Sistema de Monitoramento Financeiro`;

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilio_account_sid}:${twilio_auth_token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886', // Twilio Sandbox number
        To: `whatsapp:${phone_number}`,
        Body: testMessage,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro Twilio:', error);
      throw new Error(`Erro do Twilio: ${response.status}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem de teste enviada com sucesso',
        twilio_response: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
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
