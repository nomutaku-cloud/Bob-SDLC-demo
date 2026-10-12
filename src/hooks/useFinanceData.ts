import { useState, useEffect, useCallback } from 'react';
import {
  TimeRange,
  MarketQuote,
  ComparisonChartPoint,
  CompanyInfo,
} from '../types/finance';
import { financeService } from '../services/financeService';
import { DEFAULT_COMPANIES } from '../services/config/companies';

export function useFinanceData() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1d');
  const [symbols, setSymbols] = useState<string[]>(
    DEFAULT_COMPANIES.map((c) => c.symbol)
  );

  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [chartData, setChartData] = useState<ComparisonChartPoint[]>([]);
  const [trackedCompanies, setTrackedCompanies] = useState<CompanyInfo[]>(DEFAULT_COMPANIES);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = useCallback(async (bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    if (bypassCache) {
      financeService.clearCache();
    }
    try {
      // 1. クォートデータ取得
      const quoteResults = await financeService.getQuotes(symbols);
      setQuotes(quoteResults);

      // 2. 比較履歴データ取得
      const historyResult = await financeService.getComparisonHistory(symbols, selectedRange);
      setChartData(historyResult.chartPoints);
      setTrackedCompanies(historyResult.companies);

      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch financial data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [symbols, selectedRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addSymbol = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    if (!sym) return;

    setSymbols((prev) => {
      if (prev.includes(sym)) return prev;
      return [...prev, sym];
    });
  }, []);

  const removeSymbol = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    if (sym === 'IBM') return; // IBMは固定

    setSymbols((prev) => prev.filter((s) => s !== sym));
  }, []);

  return {
    selectedRange,
    setSelectedRange,
    symbols,
    quotes,
    chartData,
    trackedCompanies,
    isLoading,
    error,
    lastUpdated,
    refresh: () => fetchData(true),
    addSymbol,
    removeSymbol,
  };
}
