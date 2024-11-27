export interface TrendAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: number;
  isBuySignal: boolean;
  analysis: string;
}