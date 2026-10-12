import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('YahooFinanceService.validateSymbol', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('形式不正な銘柄はAPIを呼ばずに format として拒否されること', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const service = new YahooFinanceService();
    const result = await service.validateSymbol('!!');
    expect(result).toMatchObject({ valid: false, reason: 'format' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('対応企業リストの銘柄はAPIを呼ばずに有効と判定されること', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    const service = new YahooFinanceService();
    const result = await service.validateSymbol('aapl');
    expect(result.valid).toBe(true);
    expect(result.company?.symbol).toBe('AAPL');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('APIが銘柄を見つけられない場合はモックにフォールバックせず not_found となること', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        chart: { result: null, error: { code: 'Not Found', description: 'No data found' } },
      }),
    }) as unknown as typeof fetch;
    const service = new YahooFinanceService();
    const result = await service.validateSymbol('ZZZZ');
    expect(result).toMatchObject({ valid: false, symbol: 'ZZZZ', reason: 'not_found' });
  });

  it('APIがデータを返す未登録銘柄は有効と判定されること', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        chart: {
          result: [{ meta: { symbol: 'NVDA', currency: 'USD' }, indicators: { quote: [] } }],
          error: null,
        },
      }),
    }) as unknown as typeof fetch;
    const service = new YahooFinanceService();
    const result = await service.validateSymbol('NVDA');
    expect(result.valid).toBe(true);
    expect(result.company?.symbol).toBe('NVDA');
  });

  it('ネットワークに到達できない未登録銘柄は unsupported となること', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch;
    const service = new YahooFinanceService();
    const result = await service.validateSymbol('NVDA');
    expect(result).toMatchObject({ valid: false, reason: 'unsupported' });
  });
});
