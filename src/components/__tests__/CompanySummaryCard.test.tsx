import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanySummaryCard } from '../dashboard/CompanySummaryCard';
import { MarketQuote } from '../../types/finance';

describe('CompanySummaryCard', () => {
  const mockQuote: MarketQuote = {
    symbol: 'IBM',
    name: 'International Business Machines',
    price: 218.5,
    change: 3.25,
    changePercent: 1.51,
    open: 215.0,
    high: 219.0,
    low: 214.5,
    volume: 3500000,
    currency: 'USD',
    updatedAt: new Date().toISOString(),
  };

  it('企業名、株価、変動率が表示されること', () => {
    render(<CompanySummaryCard quote={mockQuote} isPrimary={true} />);

    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('International Business Machines')).toBeInTheDocument();
    expect(screen.getByText('$218.50')).toBeInTheDocument();
    expect(screen.getByText('+3.25 (+1.51%)')).toBeInTheDocument();
  });

  it('プライマリカードの場合にスタイルクラスが付与されること', () => {
    const { container } = render(<CompanySummaryCard quote={mockQuote} isPrimary={true} />);
    const cardEl = container.querySelector('.card-primary');
    expect(cardEl).toBeInTheDocument();
  });
});
