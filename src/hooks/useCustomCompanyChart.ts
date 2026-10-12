import { useState, useEffect, useCallback, useRef } from 'react';
import { TimeRange, ComparisonChartPoint, CompanyInfo } from '../types/finance';
import { financeService } from '../services/financeService';
import { getSymbolErrorMessage } from '../services/symbolValidation';

const BASELINE_SYMBOL = 'IBM';

/**
 * ユーザーが選択した企業の追加チャート用の状態管理。
 * 既存ダッシュボード（useFinanceData）とは独立しており、期間（range）のみ共有する。
 */
export function useCustomCompanyChart(range: TimeRange) {
  const [selectedCompany, setSelectedCompany] = useState<CompanyInfo | null>(null);
  const [chartData, setChartData] = useState<ComparisonChartPoint[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 古いリクエストの結果で最新の状態を上書きしないためのID
  const requestIdRef = useRef(0);

  const selectSymbol = useCallback(async (input: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await financeService.validateSymbol(input);
      if (requestId !== requestIdRef.current) return;

      if (!result.valid || !result.company) {
        setSelectedCompany(null);
        setChartData([]);
        setCompanies([]);
        setError(getSymbolErrorMessage(result.symbol, result.reason ?? 'not_found'));
        setIsLoading(false);
        return;
      }
      // 同じ企業の再選択でも再取得されるよう、常に新しい参照をセットする
      setSelectedCompany({ ...result.company });
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError('銘柄の検証中にエラーが発生しました。時間をおいて再度お試しください。');
      setIsLoading(false);
    }
  }, []);

  // 選択企業または期間が変わったらIBMとの比較データを取得
  useEffect(() => {
    if (!selectedCompany) return;
    const requestId = ++requestIdRef.current;
    const symbols =
      selectedCompany.symbol === BASELINE_SYMBOL
        ? [BASELINE_SYMBOL]
        : [BASELINE_SYMBOL, selectedCompany.symbol];

    setIsLoading(true);
    setError(null);
    financeService
      .getComparisonHistory(symbols, range)
      .then((res) => {
        if (requestId !== requestIdRef.current) return;
        setChartData(res.chartPoints);
        setCompanies(res.companies);
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return;
        setChartData([]);
        setError(
          (err as Error)?.message ||
            `銘柄「${selectedCompany.symbol}」のチャートデータを取得できませんでした。`
        );
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setIsLoading(false);
      });
  }, [selectedCompany, range]);

  const clear = useCallback(() => {
    requestIdRef.current++;
    setSelectedCompany(null);
    setChartData([]);
    setCompanies([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    selectedCompany,
    chartData,
    companies,
    isLoading,
    error,
    selectSymbol,
    clear,
  };
}
