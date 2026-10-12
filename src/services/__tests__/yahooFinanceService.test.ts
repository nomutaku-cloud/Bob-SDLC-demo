import { describe, it, expect, beforeEach } from 'vitest';
import { YahooFinanceService } from '../yahooFinanceService';

describe('YahooFinanceService', () => {
  let service: YahooFinanceService;

  beforeEach(() => {
    service = new YahooFinanceService({ timeoutMs: 1000, cacheTtlMs: 5000 });
  });

  it('IBMのクォートデータを取得できること（フォールバック時も有効な形式）', async () => {
    const quote = await service.getQuote('IBM');
    expect(quote.symbol).toBe('IBM');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.currency).toBe('USD');
  });

  it('複数銘柄のクォートデータを一括取得できること', async () => {
    const quotes = await service.getQuotes(['IBM', 'MSFT', 'ORCL']);
    expect(quotes).toHaveLength(3);
    expect(quotes[0].symbol).toBe('IBM');
    expect(quotes[1].symbol).toBe('MSFT');
    expect(quotes[2].symbol).toBe('ORCL');
  });

  it('短期（7d）および四半期（3mo）の履歴データを取得できること', async () => {
    const history7d = await service.getHistory('IBM', '7d');
    expect(history7d.symbol).toBe('IBM');
    expect(history7d.range).toBe('7d');
    expect(history7d.points.length).toBeGreaterThan(0);

    const history3mo = await service.getHistory('IBM', '3mo');
    expect(history3mo.symbol).toBe('IBM');
    expect(history3mo.range).toBe('3mo');
    expect(history3mo.points.length).toBeGreaterThan(0);
  });

  it('比較チャートデータを取得でき、自動的に各社のメタデータが付与されること', async () => {
    const comparison = await service.getComparisonHistory(['IBM', 'MSFT', 'ORCL'], '7d');
    expect(comparison.companies).toHaveLength(3);
    expect(comparison.chartPoints.length).toBeGreaterThan(0);
    expect(comparison.chartPoints[0]).toHaveProperty('IBM');
    expect(comparison.chartPoints[0]).toHaveProperty('MSFT');
    expect(comparison.chartPoints[0]).toHaveProperty('ORCL');
  });

  it('キャッシュが機能し、2回目の呼び出しで高速に応答すること', async () => {
    const start = performance.now();
    await service.getQuote('IBM');
    const firstDuration = performance.now() - start;

    const startCached = performance.now();
    await service.getQuote('IBM');
    const secondDuration = performance.now() - startCached;

    expect(secondDuration).toBeLessThanOrEqual(firstDuration + 10);
  });
});
