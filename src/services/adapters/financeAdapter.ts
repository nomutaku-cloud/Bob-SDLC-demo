import {
  MarketQuote,
  CompanyHistory,
  ComparisonChartPoint,
  CompanyInfo,
  HistoricalPoint,
  TimeRange,
} from '../../types/finance';
import { YahooChartResult, YahooQuoteItem } from '../api/yahooFinanceTypes';

/**
 * 騰落率の計算（安全なゼロ除算チェック付き）
 */
export function calculateChangePercent(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

/**
 * 日時フォーマッター
 */
function formatDateLabel(timestampSec: number, range: TimeRange): string {
  const d = new Date(timestampSec * 1000);
  if (range === '1d') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (range === '7d') {
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * Yahoo Finance Chart API レスポンスを CompanyHistory に正規化
 */
export function normalizeYahooChartResult(
  result: YahooChartResult,
  range: TimeRange
): CompanyHistory {
  const { meta, timestamp = [], indicators } = result;
  const quoteData = indicators.quote?.[0] || {};
  const closes = quoteData.close || [];
  const opens = quoteData.open || [];
  const highs = quoteData.high || [];
  const lows = quoteData.low || [];
  const volumes = quoteData.volume || [];

  const points: HistoricalPoint[] = [];

  for (let i = 0; i < timestamp.length; i++) {
    const rawClose = closes[i];
    // 欠損値（nullや未定義）のスキップまたは補間
    if (rawClose !== null && rawClose !== undefined && !isNaN(rawClose)) {
      const tsSec = timestamp[i];
      const close = Number(rawClose.toFixed(2));
      const open = opens[i] ? Number(opens[i]!.toFixed(2)) : close;
      const high = highs[i] ? Number(highs[i]!.toFixed(2)) : close;
      const low = lows[i] ? Number(lows[i]!.toFixed(2)) : close;
      const volume = volumes[i] ?? 0;

      points.push({
        timestamp: new Date(tsSec * 1000).toISOString(),
        dateLabel: formatDateLabel(tsSec, range),
        close,
        open,
        high,
        low,
        volume,
      });
    }
  }

  return {
    symbol: meta.symbol.toUpperCase(),
    range,
    points,
  };
}

/**
 * Yahoo Finance Chart Metaから株価サマリー（MarketQuote）を抽出・正規化
 */
export function normalizeYahooChartMetaToQuote(
  result: YahooChartResult,
  companyInfo?: CompanyInfo
): MarketQuote {
  const { meta } = result;
  const price = meta.regularMarketPrice ?? meta.previousClose ?? 0;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = Number((price - prevClose).toFixed(2));
  const changePercent = calculateChangePercent(price, prevClose);

  return {
    symbol: meta.symbol.toUpperCase(),
    name: companyInfo?.name || meta.symbol.toUpperCase(),
    price: Number(price.toFixed(2)),
    change,
    changePercent,
    open: Number((meta.regularMarketPrice ?? price).toFixed(2)),
    high: Number((meta.regularMarketDayHigh ?? price).toFixed(2)),
    low: Number((meta.regularMarketDayLow ?? price).toFixed(2)),
    volume: meta.regularMarketVolume ?? 0,
    currency: meta.currency || 'USD',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Yahoo Finance Quote API アイテムを MarketQuote に正規化
 */
export function normalizeYahooQuoteItem(
  item: YahooQuoteItem,
  companyInfo?: CompanyInfo
): MarketQuote {
  return {
    symbol: item.symbol.toUpperCase(),
    name: companyInfo?.name || item.longName || item.shortName || item.symbol.toUpperCase(),
    price: Number(item.regularMarketPrice.toFixed(2)),
    change: Number(item.regularMarketChange.toFixed(2)),
    changePercent: Number(item.regularMarketChangePercent.toFixed(2)),
    open: Number((item.regularMarketOpen ?? item.regularMarketPrice).toFixed(2)),
    high: Number((item.regularMarketDayHigh ?? item.regularMarketPrice).toFixed(2)),
    low: Number((item.regularMarketDayLow ?? item.regularMarketPrice).toFixed(2)),
    volume: item.regularMarketVolume ?? 0,
    currency: item.currency || 'USD',
    updatedAt: item.regularMarketTime
      ? new Date(item.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
  };
}

/**
 * 複数企業のヒストリカルデータを同一タイムラインの比較チャート用データ構造に統合
 */
export function buildComparisonChartData(
  histories: Record<string, CompanyHistory>
): ComparisonChartPoint[] {
  const symbols = Object.keys(histories);
  if (symbols.length === 0) return [];

  const basePoints = histories[symbols[0]]?.points || [];

  return basePoints.map((basePt, index) => {
    const row: ComparisonChartPoint = {
      dateLabel: basePt.dateLabel,
    };

    for (const sym of symbols) {
      const pt = histories[sym]?.points[index];
      if (pt) {
        row[sym] = pt.close;
      }
    }
    return row;
  });
}

/**
 * 相対パフォーマンス（基準日を100%とした変化率）の比較データに正規化
 */
export function normalizeToRelativePerformance(
  histories: Record<string, CompanyHistory>
): ComparisonChartPoint[] {
  const symbols = Object.keys(histories);
  if (symbols.length === 0) return [];

  const basePoints = histories[symbols[0]]?.points || [];
  const initialPrices: Record<string, number> = {};

  for (const sym of symbols) {
    const firstClose = histories[sym]?.points[0]?.close;
    if (firstClose && firstClose > 0) {
      initialPrices[sym] = firstClose;
    }
  }

  return basePoints.map((basePt, index) => {
    const row: ComparisonChartPoint = {
      dateLabel: basePt.dateLabel,
    };

    for (const sym of symbols) {
      const pt = histories[sym]?.points[index];
      const initial = initialPrices[sym];
      if (pt && initial) {
        const relativeChange = Number((((pt.close - initial) / initial) * 100).toFixed(2));
        row[sym] = relativeChange;
      }
    }
    return row;
  });
}

/**
 * 任意の未加工クォートオブジェクトをMarketQuote型に正規化
 */
export function normalizeRawQuote(
  raw: {
    symbol: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketOpen?: number;
    regularMarketDayHigh?: number;
    regularMarketDayLow?: number;
    regularMarketVolume?: number;
    currency?: string;
  },
  companyInfo?: CompanyInfo
): MarketQuote {
  const price = raw.regularMarketPrice ?? 0;
  const change = raw.regularMarketChange ?? 0;
  const changePercent = raw.regularMarketChangePercent ?? 0;

  return {
    symbol: raw.symbol.toUpperCase(),
    name: companyInfo?.name || raw.symbol.toUpperCase(),
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    open: Number((raw.regularMarketOpen ?? price).toFixed(2)),
    high: Number((raw.regularMarketDayHigh ?? price).toFixed(2)),
    low: Number((raw.regularMarketDayLow ?? price).toFixed(2)),
    volume: raw.regularMarketVolume ?? 0,
    currency: raw.currency || 'USD',
    updatedAt: new Date().toISOString(),
  };
}
