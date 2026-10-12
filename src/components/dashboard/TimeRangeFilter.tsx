import React from 'react';
import { TimeRange } from '../../types/finance';

interface TimeRangeFilterProps {
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
  disabled?: boolean;
}

const RANGES: { id: TimeRange; label: string; description: string }[] = [
  { id: '1d', label: '当日 (Current Day)', description: 'Today’s intraday market metrics' },
  { id: '7d', label: '過去7日間 (Last 7 Days)', description: 'Short-term relative trend comparison' },
  { id: '3mo', label: '前四半期 (Last Quarter)', description: 'Quarterly performance overview' },
];

export const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  selectedRange,
  onSelectRange,
  disabled = false,
}) => {
  return (
    <div className="time-filter-container">
      <div className="time-filter-tabs" role="tablist" aria-label="Select Time Range">
        {RANGES.map((r) => {
          const isActive = selectedRange === r.id;
          return (
            <button
              key={r.id}
              role="tab"
              aria-selected={isActive}
              className={`filter-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectRange(r.id)}
              disabled={disabled}
            >
              <span className="tab-label">{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
