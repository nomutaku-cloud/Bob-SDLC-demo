export type TimeRange = '1d' | '7d' | '3mo';

export interface CompanyInfo {
  symbol: string;
  name: string;
  color: string;
  isPrimary?: boolean; // IBMなどの主対象フラグ
}

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  currency: string;
  updatedAt: string;
}

export interface HistoricalPoint {
  timestamp: string; // ISO文字列または表示用フォーマット文字列
  dateLabel: string; // チャートX軸用
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

export interface CompanyHistory {
  symbol: string;
  range: TimeRange;
  points: HistoricalPoint[];
}

export interface ComparisonChartPoint {
  dateLabel: string;
  [symbol: string]: number | string; // 例: { dateLabel: '10/24', IBM: 215.4, MSFT: 428.1, ... }
}

export type SymbolValidationReason = 'format' | 'not_found' | 'unsupported';

export interface SymbolValidationResult {
  valid: boolean;
  symbol: string;
  company?: CompanyInfo;
  reason?: SymbolValidationReason;
}

export interface IFinanceService {
  validateSymbol(symbol: string): Promise<SymbolValidationResult>;
  getTrackedCompanies(): Promise<CompanyInfo[]>;
  getQuote(symbol: string): Promise<MarketQuote>;
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  getHistory(symbol: string, range: TimeRange): Promise<CompanyHistory>;
  getComparisonHistory(symbols: string[], range: TimeRange): Promise<{
    chartPoints: ComparisonChartPoint[];
    companies: CompanyInfo[];
  }>;
}
