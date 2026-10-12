import {
  IFinanceService,
  TimeRange,
  CompanyInfo,
  MarketQuote,
  CompanyHistory,
  ComparisonChartPoint,
} from '../types/finance';
import { YahooFinanceClient, YahooClientConfig } from './api/yahooFinanceClient';
import { MockFinanceService } from './mockFinanceService';
import { companyRegistry } from './companyRegistry';
import {
  normalizeYahooChartResult,
  normalizeYahooChartMetaToQuote,
  normalizeYahooQuoteItem,
  buildComparisonChartData,
  normalizeToRelativePerformance,
} from './adapters/financeAdapter';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class YahooFinanceService implements IFinanceService {
  private client: YahooFinanceClient;
  private fallbackService: MockFinanceService;
  private quoteCache: Map<string, CacheEntry<MarketQuote>> = new Map();
  private historyCache: Map<string, CacheEntry<CompanyHistory>> = new Map();
  private cacheTtlMs: number;

  constructor(config?: YahooClientConfig & { cacheTtlMs?: number }) {
    this.client = new YahooFinanceClient(config);
    this.fallbackService = new MockFinanceService(0);
    this.cacheTtlMs = config?.cacheTtlMs || 60_000; // 1分間キャッシュ
  }

  async getTrackedCompanies(): Promise<CompanyInfo[]> {
    return companyRegistry.getDefaultCompanies();
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const sym = symbol.toUpperCase().trim();
    const cacheKey = sym;
    const cached = this.quoteCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    const company = companyRegistry.getCompany(sym);

    try {
      // 1. Quotes API を試行
      const quoteRes = await this.client.fetchQuotes([sym]);
      const item = quoteRes.quoteResponse.result?.[0];
      if (item) {
        const quote = normalizeYahooQuoteItem(item, company);
        this.quoteCache.set(cacheKey, { data: quote, timestamp: Date.now() });
        return quote;
      }

      // 2. Quotes APIで取得できない場合は Chart APIのMetaから抽出
      const chartRes = await this.client.fetchChart(sym, '1d');
      const chartResult = chartRes.chart.result?.[0];
      if (chartResult) {
        const quote = normalizeYahooChartMetaToQuote(chartResult, company);
        this.quoteCache.set(cacheKey, { data: quote, timestamp: Date.now() });
        return quote;
      }

      throw new Error(`No quote data returned for ${sym}`);
    } catch (err) {
      console.warn(`[YahooFinanceService] Falling back to mock quote for ${sym}:`, err);
      const mockQuote = await this.fallbackService.getQuote(sym);
      mockQuote.name = company.name;
      this.quoteCache.set(cacheKey, { data: mockQuote, timestamp: Date.now() });
      return mockQuote;
    }
  }

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return Promise.all(symbols.map((sym) => this.getQuote(sym)));
  }

  async getHistory(symbol: string, range: TimeRange): Promise<CompanyHistory> {
    const sym = symbol.toUpperCase().trim();
    const cacheKey = `${sym}_${range}`;
    const cached = this.historyCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    try {
      const res = await this.client.fetchChart(sym, range);
      const chartResult = res.chart.result?.[0];
      if (chartResult && chartResult.timestamp && chartResult.timestamp.length > 0) {
        const history = normalizeYahooChartResult(chartResult, range);
        this.historyCache.set(cacheKey, { data: history, timestamp: Date.now() });
        return history;
      }
      throw new Error(`Incomplete chart data for ${sym}`);
    } catch (err) {
      console.warn(`[YahooFinanceService] Falling back to mock history for ${sym} (${range}):`, err);
      const mockHistory = await this.fallbackService.getHistory(sym, range);
      this.historyCache.set(cacheKey, { data: mockHistory, timestamp: Date.now() });
      return mockHistory;
    }
  }

  async getComparisonHistory(
    symbols: string[],
    range: TimeRange
  ): Promise<{
    chartPoints: ComparisonChartPoint[];
    companies: CompanyInfo[];
  }> {
    const histories: Record<string, CompanyHistory> = {};
    const companies: CompanyInfo[] = [];

    const results = await Promise.all(
      symbols.map(async (sym) => {
        const comp = companyRegistry.getCompany(sym);
        const history = await this.getHistory(sym, range);
        return { comp, history };
      })
    );

    for (const { comp, history } of results) {
      histories[comp.symbol] = history;
      companies.push(comp);
    }

    const chartPoints =
      range === '1d'
        ? buildComparisonChartData(histories)
        : normalizeToRelativePerformance(histories);

    return {
      chartPoints,
      companies,
    };
  }

  /**
   * キャッシュのクリア（手動リフレッシュ時用）
   */
  clearCache(): void {
    this.quoteCache.clear();
    this.historyCache.clear();
  }
}
