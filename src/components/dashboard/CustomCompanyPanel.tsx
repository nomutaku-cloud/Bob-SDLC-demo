import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';
import { ALL_SUPPORTED_COMPANIES } from '../../services/config/companies';
import { useCustomCompanyChart } from '../../hooks/useCustomCompanyChart';
import { TimeRange } from '../../types/finance';

interface CustomCompanyPanelProps {
  range: TimeRange;
}

const DATALIST_ID = 'custom-company-options';

/**
 * ユーザーが指定した企業をIBMと比較する追加チャート。
 * 既存のメイン比較チャートには影響しない独立したパネル。
 */
export const CustomCompanyPanel: React.FC<CustomCompanyPanelProps> = ({ range }) => {
  const [input, setInput] = useState('');
  const { selectedCompany, chartData, companies, isLoading, error, selectSymbol, clear } =
    useCustomCompanyChart(range);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    selectSymbol(input);
  };

  const handleClear = () => {
    setInput('');
    clear();
  };

  const renderBody = () => {
    if (isLoading) {
      return <LoadingSpinner message="選択した企業のデータを読み込み中..." />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    if (!selectedCompany) {
      return (
        <div className="chart-empty-state">
          <p>銘柄コードを入力するか候補から企業を選択すると、IBMとの比較チャートが表示されます。</p>
        </div>
      );
    }
    return <ComparisonLineChart data={chartData} companies={companies} range={range} height={300} />;
  };

  return (
    <section className="custom-company-section" data-testid="custom-company-panel">
      <Card
        title="選択企業の比較チャート (Custom Company vs IBM)"
        subtitle={
          selectedCompany
            ? `${selectedCompany.symbol} (${selectedCompany.name}) と IBM の比較`
            : '任意の企業を指定してIBMと比較できます'
        }
      >
        <form className="custom-company-form" onSubmit={handleSubmit}>
          <label htmlFor="custom-company-input" className="selector-label">
            銘柄コード / 企業:
          </label>
          <input
            id="custom-company-input"
            type="text"
            className="input-text"
            placeholder="例: GOOGL, AAPL"
            list={DATALIST_ID}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="比較する銘柄コード"
          />
          <datalist id={DATALIST_ID}>
            {ALL_SUPPORTED_COMPANIES.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.name}
              </option>
            ))}
          </datalist>
          <button
            type="submit"
            className="btn btn-primary btn-sm flex items-center"
            disabled={isLoading}
          >
            <Search size={14} />
            <span style={{ marginLeft: 4 }}>表示</span>
          </button>
          {(selectedCompany || error) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center"
              onClick={handleClear}
            >
              <X size={14} />
              <span style={{ marginLeft: 4 }}>クリア</span>
            </button>
          )}
        </form>
        {renderBody()}
      </Card>
    </section>
  );
};
