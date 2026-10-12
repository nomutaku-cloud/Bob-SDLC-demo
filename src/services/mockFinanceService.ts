import {
  IFinanceService,
  TimeRange,
  CompanyInfo,
  MarketQuote,
  CompanyHistory,
  ComparisonChartPoint,
} from '../types/finance';
import { DEFAULT_COMPANIES, getCompanyBySymbol } from './config/companies';
import { generateMockQuotes, generateMockHistory } from './mock/mockData';
import { normalizeToRelativePerformance, buildComparisonChartData } from './adapters/financeAdapter';

export class MockFinanceService implements IFinanceService {
  private latencyMs: number;

  constructor(latencyMs = 250) {
    this.latencyMs = latencyMs;
  }

  private async delay(): Promise<void> {
    if (this.latencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    }
  }

  async getTrackedCompanies(): Promise<CompanyInfo[]> {
    await this.delay();
    return [...DEFAULT_COMPANIES];
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    await this.delay();
    const quotes = generateMockQuotes([symbol]);
    if (!quotes.length) {
      throw new Error(`Quote not found for symbol: ${symbol}`);
    }
    return quotes[0];
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    await this.delay();
    return generateMockQuotes(symbols);
  }

  async getHistory(symbol: string, range: TimeRange): Promise<CompanyHistory> {
    await this.delay();
    const points = generateMockHistory(symbol, range);
    return {
      symbol: symbol.toUpperCase(),
      range,
      points,
    };
  }

  async getComparisonHistory(
    symbols: string[],
    range: TimeRange
  ): Promise<{
    chartPoints: ComparisonChartPoint[];
    companies: CompanyInfo[];
  }> {
    await this.delay();
    const histories: Record<string, CompanyHistory> = {};
    const companies: CompanyInfo[] = [];

    for (const sym of symbols) {
      const history = await this.getHistory(sym, range);
      histories[sym.toUpperCase()] = history;

      const comp = getCompanyBySymbol(sym) || {
        symbol: sym.toUpperCase(),
        name: sym.toUpperCase(),
        color: '#888888',
      };
      companies.push(comp);
    }

    // 7d または 3mo の場合は相対騰落率(%)で正規化、1dは生価格または正規化比較
    const chartPoints =
      range === '1d'
        ? buildComparisonChartData(histories)
        : normalizeToRelativePerformance(histories);

    return {
      chartPoints,
      companies,
    };
  }
}
