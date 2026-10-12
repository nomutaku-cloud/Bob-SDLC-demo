import { describe, it, expect } from 'vitest';
import { MockFinanceService } from '../mockFinanceService';

describe('MockFinanceService', () => {
  const service = new MockFinanceService(0); // テスト用に遅延0

  it('IBMを含むデフォルト追跡企業を取得できること', async () => {
    const companies = await service.getTrackedCompanies();
    expect(companies.length).toBeGreaterThanOrEqual(5);
    expect(companies.some((c) => c.symbol === 'IBM')).toBe(true);
  });

  it('指定したシンボルのクォートデータを取得できること', async () => {
    const quote = await service.getQuote('IBM');
    expect(quote.symbol).toBe('IBM');
    expect(quote.price).toBeGreaterThan(0);
  });

  it('3つの期間（1d, 7d, 3mo）の履歴データを取得できること', async () => {
    const h1d = await service.getHistory('IBM', '1d');
    expect(h1d.points.length).toBeGreaterThan(0);
    expect(h1d.range).toBe('1d');

    const h7d = await service.getHistory('IBM', '7d');
    expect(h7d.points.length).toBe(7);
    expect(h7d.range).toBe('7d');

    const h3mo = await service.getHistory('IBM', '3mo');
    expect(h3mo.points.length).toBe(12);
    expect(h3mo.range).toBe('3mo');
  });

  it('複数企業の比較履歴データを取得できること', async () => {
    const comparison = await service.getComparisonHistory(['IBM', 'MSFT'], '7d');
    expect(comparison.chartPoints.length).toBe(7);
    expect(comparison.companies).toHaveLength(2);
    expect(comparison.chartPoints[0]).toHaveProperty('IBM');
    expect(comparison.chartPoints[0]).toHaveProperty('MSFT');
  });
});
