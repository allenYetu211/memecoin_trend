import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CoinPrice } from './interfaces/coin-price.interface';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  async getCoinPrice(coinId: string): Promise<CoinPrice> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/simple/price`,
        {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_24hr_vol: true,
          },
        }
      );

      const data = response.data[coinId];
      return {
        price: data.usd,
        priceChange24h: data.usd_24h_change,
        volume24h: data.usd_24h_vol,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch price for ${coinId}:`, error.message);
      throw error;
    }
  }

  async getHistoricalPrices(coinId: string, days: number): Promise<number[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: 'hourly',
          },
        }
      );

      return response.data.prices.map(([, price]) => price);
    } catch (error) {
      this.logger.error(`Failed to fetch historical prices for ${coinId}:`, error.message);
      throw error;
    }
  }
}