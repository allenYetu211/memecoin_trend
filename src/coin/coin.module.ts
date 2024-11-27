import { Module } from '@nestjs/common';
import { CoinService } from './coin.service';
import { CoinGeckoService } from './coingecko.service';
import { PriceAnalyzerService } from './price-analyzer.service';

@Module({
  providers: [CoinService, CoinGeckoService, PriceAnalyzerService],
})
export class CoinModule {}