import React from 'react';
import { MarketQuote } from '../../types/finance';
import { Card } from '../common/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CompanySummaryCardProps {
  quote: MarketQuote;
  isPrimary?: boolean;
}

export const CompanySummaryCard: React.FC<CompanySummaryCardProps> = ({
  quote,
  isPrimary = false,
}) => {
  const isPositive = quote.change >= 0;

  return (
    <Card
      isPrimary={isPrimary}
      className="summary-card"
      title={
        <div className="card-symbol-title">
          <span className="symbol-tag">{quote.symbol}</span>
          <span className="company-name">{quote.name}</span>
        </div>
      }
    >
      <div className="price-container">
        <span className="current-price">
          ${quote.price.toFixed(2)}
        </span>
        <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            {isPositive ? '+' : ''}
            {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
            {quote.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Open</span>
          <span className="metric-value">${quote.open.toFixed(2)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">High</span>
          <span className="metric-value">${quote.high.toFixed(2)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Low</span>
          <span className="metric-value">${quote.low.toFixed(2)}</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Volume</span>
          <span className="metric-value">{(quote.volume / 1_000_000).toFixed(2)}M</span>
        </div>
      </div>
    </Card>
  );
};
