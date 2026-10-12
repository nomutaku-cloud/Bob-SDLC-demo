import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeRangeFilter } from '../dashboard/TimeRangeFilter';

describe('TimeRangeFilter', () => {
  it('3つの期間タブがすべて表示されること', () => {
    const handleSelect = vi.fn();
    render(<TimeRangeFilter selectedRange="1d" onSelectRange={handleSelect} />);

    expect(screen.getByText(/当日/)).toBeInTheDocument();
    expect(screen.getByText(/過去7日間/)).toBeInTheDocument();
    expect(screen.getByText(/前四半期/)).toBeInTheDocument();
  });

  it('タブをクリックした際にコールバックが呼び出されること', () => {
    const handleSelect = vi.fn();
    render(<TimeRangeFilter selectedRange="1d" onSelectRange={handleSelect} />);

    const weekTab = screen.getByText(/過去7日間/);
    fireEvent.click(weekTab);

    expect(handleSelect).toHaveBeenCalledWith('7d');
  });
});
