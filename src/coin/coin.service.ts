import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinGeckoService } from './coingecko.service';
import { PriceAnalyzerService } from './price-analyzer.service';

@Injectable()
export class CoinService {
  private readonly logger = new Logger(CoinService.name);
  private readonly monitoredCoins = [
    'pepe',
    'dogecoin',
    'shiba-inu',
  ];

  constructor(
    private readonly coinGeckoService: CoinGeckoService,
    private readonly priceAnalyzerService: PriceAnalyzerService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorPrices() {
    for (const coinId of this.monitoredCoins) {
      try {
        const currentPrice = await this.coinGeckoService.getCoinPrice(coinId);
        const historicalPrices = await this.coinGeckoService.getHistoricalPrices(coinId, 30);
        
        const analysis = this.priceAnalyzerService.analyzeTrend(
          currentPrice,
          historicalPrices,
        );

        this.logger.log(`
          Coin: ${coinId.toUpperCase()}
          Current Price: $${currentPrice.price}
          ${analysis.analysis}
        `);

        if (analysis.isBuySignal) {
          this.logger.warn(`🚨 Buy Signal detected for ${coinId.toUpperCase()}!`);
        }
      } catch (error) {
        this.logger.error(`Error monitoring ${coinId}:`, error.message);
      }
    }
  }
}