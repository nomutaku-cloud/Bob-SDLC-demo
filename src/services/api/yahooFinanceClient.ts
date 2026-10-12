import { YahooChartResponse, YahooQuoteResponse } from './yahooFinanceTypes';
import { TimeRange } from '../../types/finance';

export interface YahooClientConfig {
  baseUrl?: string;
  proxyUrl?: string;
  timeoutMs?: number;
}

export class YahooFinanceClient {
  private proxyUrl?: string;
  private timeoutMs: number;

  constructor(config?: YahooClientConfig) {
    this.proxyUrl = config?.proxyUrl;
    this.timeoutMs = config?.timeoutMs || 8000;
  }

  private mapRangeParams(range: TimeRange): { range: string; interval: string } {
    switch (range) {
      case '1d':
        return { range: '1d', interval: '15m' };
      case '7d':
        return { range: '5d', interval: '1d' };
      case '3mo':
        return { range: '3mo', interval: '1wk' };
    }
  }

  async fetchChart(symbol: string, range: TimeRange): Promise<YahooChartResponse> {
    const { range: rangeParam, interval } = this.mapRangeParams(range);
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=${rangeParam}&interval=${interval}&includePrePost=false`;

    const fetchUrl = this.proxyUrl
      ? `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    const fetchOptions: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
    };

    // ブラウザ環境かつテスト環境(jsdom)以外でタイムアウトシグナルを付与
    if (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !navigator.userAgent?.includes('jsdom') &&
      typeof AbortSignal !== 'undefined' &&
      typeof AbortSignal.timeout === 'function'
    ) {
      fetchOptions.signal = AbortSignal.timeout(this.timeoutMs);
    }

    const response = await fetch(fetchUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
    }

    const data: YahooChartResponse = await response.json();
    if (data.chart.error) {
      throw new Error(data.chart.error.description || 'Failed to fetch chart from Yahoo Finance');
    }

    return data;
  }

  async fetchQuotes(symbols: string[]): Promise<YahooQuoteResponse> {
    const joined = symbols.map(encodeURIComponent).join(',');
    const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${joined}`;

    const fetchUrl = this.proxyUrl
      ? `${this.proxyUrl}?url=${encodeURIComponent(targetUrl)}`
      : targetUrl;

    const fetchOptions: RequestInit = {
      headers: {
        Accept: 'application/json',
      },
    };

    if (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !navigator.userAgent?.includes('jsdom') &&
      typeof AbortSignal !== 'undefined' &&
      typeof AbortSignal.timeout === 'function'
    ) {
      fetchOptions.signal = AbortSignal.timeout(this.timeoutMs);
    }

    const response = await fetch(fetchUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`Yahoo Finance Quotes API error: ${response.status}`);
    }

    return await response.json();
  }
}
