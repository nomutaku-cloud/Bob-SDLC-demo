import React from 'react';
import { Header } from '../common/Header';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { TimeRangeFilter } from './TimeRangeFilter';
import { CompanySummaryCard } from './CompanySummaryCard';
import { CompanySelector } from './CompanySelector';
import { CustomCompanyPanel } from './CustomCompanyPanel';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';
import { useFinanceData } from '../../hooks/useFinanceData';

export const DashboardPage: React.FC = () => {
  const {
    selectedRange,
    setSelectedRange,
    symbols,
    quotes,
    chartData,
    trackedCompanies,
    isLoading,
    error,
    lastUpdated,
    refresh,
    addSymbol,
    removeSymbol,
  } = useFinanceData();

  const getRangeTitle = () => {
    switch (selectedRange) {
      case '1d':
        return '当日市場動向 (Intraday Performance)';
      case '7d':
        return '過去7日間の相対騰落率比較 (7-Day Relative Performance %)';
      case '3mo':
        return '前四半期トレンド比較 (Quarterly Relative Performance %)';
    }
  };

  const getRangeDescription = () => {
    switch (selectedRange) {
      case '1d':
        return 'IBMおよび競合各社の当日取引時間内における価格推移とメトリクスサマリー';
      case '7d':
        return '基準日（7日前）を0%とした各社の相対的な株価パフォーマンス比較';
      case '3mo':
        return '四半期を通じた中期的な株価トレンドとボラティリティの比較推移';
    }
  };

  return (
    <div className="dashboard-container">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <main className="dashboard-main">
        {/* コントロールバー */}
        <section className="dashboard-controls">
          <TimeRangeFilter
            selectedRange={selectedRange}
            onSelectRange={setSelectedRange}
            disabled={isLoading}
          />
          <CompanySelector
            trackedSymbols={symbols}
            onAddSymbol={addSymbol}
            onRemoveSymbol={removeSymbol}
          />
        </section>

        {/* エラー表示 */}
        {error && <ErrorMessage message={error} onRetry={refresh} />}

        {/* ローディング表示 */}
        {isLoading && quotes.length === 0 ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* メイン比較チャートセクション */}
            <section className="chart-section">
              <Card
                title={getRangeTitle()}
                subtitle={getRangeDescription()}
                action={
                  <span className="badge badge-info">
                    {trackedCompanies.length} Companies Tracked
                  </span>
                }
              >
                <ComparisonLineChart
                  data={chartData}
                  companies={trackedCompanies}
                  range={selectedRange}
                />
              </Card>
            </section>

            {/* 企業サマリーカードグリッド */}
            <section className="summary-section">
              <div className="section-header">
                <h2 className="section-title">個別企業マーケットサマリー (Quotes Overview)</h2>
                <span className="section-subtitle">Real-time quote snapshot</span>
              </div>
              <div className="summary-grid">
                {quotes.map((q) => (
                  <CompanySummaryCard
                    key={q.symbol}
                    quote={q}
                    isPrimary={q.symbol === 'IBM'}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ユーザー選択企業の追加チャート（既存ダッシュボードとは独立） */}
        <CustomCompanyPanel range={selectedRange} />
      </main>
    </div>
  );
};
