import { Injectable, Logger } from '@nestjs/common';
import { CoinPrice } from './interfaces/coin-price.interface';
import { TrendAnalysis } from './interfaces/trend-analysis.interface';

@Injectable()
export class PriceAnalyzerService {
  private readonly logger = new Logger(PriceAnalyzerService.name);

  analyzeTrend(
    currentPrice: CoinPrice,
    historicalPrices: number[],
  ): TrendAnalysis {
    const priceChange24h = currentPrice.priceChange24h;
    const volume24h = currentPrice.volume24h;
    
    // Calculate moving averages
    const ma7 = this.calculateMA(historicalPrices.slice(-168), 7); // 7 days
    const ma25 = this.calculateMA(historicalPrices.slice(-600), 25); // 25 days

    // Analyze price momentum
    const momentum = this.calculateMomentum(historicalPrices);
    
    // Determine if it's a good time to buy
    const isBuySignal = this.evaluateBuySignal({
      priceChange24h,
      volume24h,
      ma7,
      ma25,
      momentum,
      currentPrice: currentPrice.price,
    });

    return {
      trend: this.determineTrend(priceChange24h, ma7, ma25),
      momentum,
      isBuySignal,
      analysis: this.generateAnalysis({
        priceChange24h,
        ma7,
        ma25,
        momentum,
        isBuySignal,
      }),
    };
  }

  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return sum / period;
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 2) return 0;
    const recent = prices.slice(-1)[0];
    const previous = prices.slice(-2)[0];
    return ((recent - previous) / previous) * 100;
  }

  private determineTrend(
    priceChange24h: number,
    ma7: number,
    ma25: number,
  ): 'bullish' | 'bearish' | 'neutral' {
    if (priceChange24h > 5 && ma7 > ma25) return 'bullish';
    if (priceChange24h < -5 && ma7 < ma25) return 'bearish';
    return 'neutral';
  }

  private evaluateBuySignal(params: {
    priceChange24h: number;
    volume24h: number;
    ma7: number;
    ma25: number;
    momentum: number;
    currentPrice: number;
  }): boolean {
    const { priceChange24h, volume24h, ma7, ma25, momentum, currentPrice } = params;

    // Buy signal conditions
    const isPriceAboveMA = currentPrice > ma25;
    const isPositiveMomentum = momentum > 0;
    const isHighVolume = volume24h > 1000000; // Adjust threshold as needed
    const isPriceRecovering = priceChange24h > -15 && priceChange24h < 20;

    return (
      isPriceAboveMA &&
      isPositiveMomentum &&
      isHighVolume &&
      isPriceRecovering
    );
  }

  private generateAnalysis(params: {
    priceChange24h: number;
    ma7: number;
    ma25: number;
    momentum: number;
    isBuySignal: boolean;
  }): string {
    const { priceChange24h, ma7, ma25, momentum, isBuySignal } = params;

    let analysis = '';

    if (isBuySignal) {
      analysis += '✅ Current market conditions suggest a potential buying opportunity. ';
    } else {
      analysis += '⚠️ Market conditions do not meet buying criteria. ';
    }

    analysis += `24h Price Change: ${priceChange24h.toFixed(2)}%. `;
    analysis += `7-day MA: $${ma7.toFixed(2)}. `;
    analysis += `25-day MA: $${ma25.toFixed(2)}. `;
    analysis += `Momentum: ${momentum.toFixed(2)}%.`;

    return analysis;
  }
}