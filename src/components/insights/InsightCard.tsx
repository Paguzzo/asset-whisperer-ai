import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";

interface Insight {
  id: string;
  title: string;
  content: string;
  insight_type: string;
  confidence_score: number;
  created_at: string;
  metadata?: {
    current_price?: number;
    change_24h?: number;
  };
}

interface InsightCardProps {
  insight: Insight;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'buy_signal':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'sell_signal':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case 'hold_signal':
      return <Minus className="h-4 w-4 text-yellow-500" />;
    default:
      return <Brain className="h-4 w-4 text-primary" />;
  }
};

const getInsightTypeLabel = (type: string) => {
  switch (type) {
    case 'buy_signal':
      return 'Sinal de Compra';
    case 'sell_signal':
      return 'Sinal de Venda';
    case 'hold_signal':
      return 'Manter Posição';
    case 'technical_analysis':
      return 'Análise Técnica';
    default:
      return 'Insight';
  }
};

const getConfidenceColor = (score: number) => {
  if (score >= 0.8) return 'bg-green-500/10 text-green-600 border-green-500/20';
  if (score >= 0.6) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
  return 'bg-red-500/10 text-red-600 border-red-500/20';
};

export function InsightCard({ insight }: InsightCardProps) {
  const formattedDate = new Date(insight.created_at).toLocaleString('pt-BR');
  const confidencePercentage = Math.round(insight.confidence_score * 100);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getInsightIcon(insight.insight_type)}
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getConfidenceColor(insight.confidence_score)}>
              {confidencePercentage}% confiança
            </Badge>
            <Badge variant="secondary">
              {getInsightTypeLabel(insight.insight_type)}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Gerado em {formattedDate}
          {insight.metadata?.current_price && (
            <span className="ml-2">
              • Preço: ${insight.metadata.current_price.toFixed(2)}
            </span>
          )}
          {insight.metadata?.change_24h && (
            <span className={`ml-2 ${insight.metadata.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              • {insight.metadata.change_24h >= 0 ? '+' : ''}{insight.metadata.change_24h.toFixed(2)}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {insight.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}