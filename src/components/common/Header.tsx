import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Finance Analytics Dashboard',
  subtitle = 'Market comparison for IBM and major enterprise competitors',
  lastUpdated,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-icon">
          <TrendingUp size={24} color="#0f62fe" />
        </div>
        <div>
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="header-actions">
        {lastUpdated && (
          <span className="last-updated">
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
        {onRefresh && (
          <button
            className="btn btn-primary btn-sm flex items-center"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh Market Data"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-icon' : ''} />
            <span style={{ marginLeft: 6 }}>Refresh</span>
          </button>
        )}
      </div>
    </header>
  );
};
