export interface YahooChartMeta {
  currency: string;
  symbol: string;
  exchangeName?: string;
  instrumentType?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
  regularMarketTime?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
}

export interface YahooChartIndicators {
  quote: Array<{
    open?: (number | null)[];
    high?: (number | null)[];
    low?: (number | null)[];
    close?: (number | null)[];
    volume?: (number | null)[];
  }>;
}

export interface YahooChartResult {
  meta: YahooChartMeta;
  timestamp?: number[];
  indicators: YahooChartIndicators;
}

export interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: {
      code: string;
      description: string;
    } | null;
  };
}

export interface YahooQuoteItem {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  currency?: string;
  regularMarketTime?: number;
}

export interface YahooQuoteResponse {
  quoteResponse: {
    result: YahooQuoteItem[];
    error: any;
  };
}
