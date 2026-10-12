import { describe, it, expect } from 'vitest';
import {
  calculateChangePercent,
  buildComparisonChartData,
  normalizeToRelativePerformance,
  normalizeRawQuote,
  normalizeYahooChartResult,
  normalizeYahooQuoteItem,
} from '../adapters/financeAdapter';
import { CompanyHistory } from '../../types/finance';
import { YahooChartResult, YahooQuoteItem } from '../api/yahooFinanceTypes';

describe('financeAdapter', () => {
  describe('calculateChangePercent', () => {
    it('正しいパーセンテージを計算できること', () => {
      expect(calculateChangePercent(110, 100)).toBe(10);
      expect(calculateChangePercent(90, 100)).toBe(-10);
    });

    it('前日終値が0またはnullの場合に0を返すこと', () => {
      expect(calculateChangePercent(100, 0)).toBe(0);
    });
  });

  describe('normalizeYahooChartResult', () => {
    it('Yahoo Chart ResultからCompanyHistoryへ正規化され、欠損値が安全に処理されること', () => {
      const mockResult: YahooChartResult = {
        meta: {
          currency: 'USD',
          symbol: 'IBM',
          regularMarketPrice: 218.5,
          chartPreviousClose: 215.0,
        },
        timestamp: [1700000000, 1700086400, 1700172800],
        indicators: {
          quote: [
            {
              open: [214.0, 216.0, 217.0],
              high: [216.5, 218.0, 219.5],
              low: [213.5, 215.0, 216.5],
              close: [215.0, null as any, 218.5], // 2番目は欠損値
              volume: [3000000, 0, 3500000],
            },
          ],
        },
      };

      const history = normalizeYahooChartResult(mockResult, '7d');
      expect(history.symbol).toBe('IBM');
      expect(history.range).toBe('7d');
      // 欠損値（null）のデータポイントはスキップされ2件になること
      expect(history.points).toHaveLength(2);
      expect(history.points[0].close).toBe(215.0);
      expect(history.points[1].close).toBe(218.5);
    });
  });

  describe('normalizeYahooQuoteItem', () => {
    it('Yahoo Quote ItemをMarketQuote型に正規化できること', () => {
      const mockItem: YahooQuoteItem = {
        symbol: 'IBM',
        longName: 'International Business Machines',
        regularMarketPrice: 218.5,
        regularMarketChange: 3.5,
        regularMarketChangePercent: 1.63,
        regularMarketOpen: 215.0,
        regularMarketDayHigh: 219.0,
        regularMarketDayLow: 214.5,
        regularMarketVolume: 4100000,
        currency: 'USD',
      };

      const quote = normalizeYahooQuoteItem(mockItem);
      expect(quote.symbol).toBe('IBM');
      expect(quote.name).toBe('International Business Machines');
      expect(quote.price).toBe(218.5);
      expect(quote.change).toBe(3.5);
      expect(quote.changePercent).toBe(1.63);
      expect(quote.currency).toBe('USD');
    });
  });

  describe('buildComparisonChartData', () => {
    it('複数銘柄のヒストリカルデータを同一タイムラインに結合できること', () => {
      const mockHistories: Record<string, CompanyHistory> = {
        IBM: {
          symbol: 'IBM',
          range: '1d',
          points: [
            { timestamp: '1', dateLabel: '09:30', close: 200 },
            { timestamp: '2', dateLabel: '10:00', close: 205 },
          ],
        },
        MSFT: {
          symbol: 'MSFT',
          range: '1d',
          points: [
            { timestamp: '1', dateLabel: '09:30', close: 400 },
            { timestamp: '2', dateLabel: '10:00', close: 410 },
          ],
        },
      };

      const result = buildComparisonChartData(mockHistories);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ dateLabel: '09:30', IBM: 200, MSFT: 400 });
      expect(result[1]).toEqual({ dateLabel: '10:00', IBM: 205, MSFT: 410 });
    });
  });

  describe('normalizeToRelativePerformance', () => {
    it('初日を基準（0%）とした相対パフォーマンスを算出できること', () => {
      const mockHistories: Record<string, CompanyHistory> = {
        IBM: {
          symbol: 'IBM',
          range: '7d',
          points: [
            { timestamp: '1', dateLabel: 'Day 1', close: 200 },
            { timestamp: '2', dateLabel: 'Day 2', close: 210 }, // +5%
          ],
        },
      };

      const result = normalizeToRelativePerformance(mockHistories);
      expect(result).toHaveLength(2);
      expect(result[0].IBM).toBe(0);
      expect(result[1].IBM).toBe(5);
    });
  });

  describe('normalizeRawQuote', () => {
    it('未加工のクォートデータをMarketQuote型に変換できること', () => {
      const raw = {
        symbol: 'IBM',
        regularMarketPrice: 215.5,
        regularMarketChange: 3.2,
        regularMarketChangePercent: 1.51,
        regularMarketOpen: 212.3,
        regularMarketDayHigh: 216.0,
        regularMarketDayLow: 211.8,
        regularMarketVolume: 4200000,
        currency: 'USD',
      };

      const quote = normalizeRawQuote(raw, {
        symbol: 'IBM',
        name: 'International Business Machines',
        color: '#0f62fe',
      });

      expect(quote.symbol).toBe('IBM');
      expect(quote.name).toBe('International Business Machines');
      expect(quote.price).toBe(215.5);
      expect(quote.change).toBe(3.2);
      expect(quote.changePercent).toBe(1.51);
      expect(quote.currency).toBe('USD');
    });
  });
});
