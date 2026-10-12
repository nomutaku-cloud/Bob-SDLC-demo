import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container" data-testid="error-message">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4 className="error-title">Data Error</h4>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button className="btn btn-secondary btn-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
