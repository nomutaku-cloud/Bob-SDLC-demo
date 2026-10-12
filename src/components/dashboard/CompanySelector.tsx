import React, { useState } from 'react';
import { ALL_SUPPORTED_COMPANIES } from '../../services/config/companies';
import { Plus, X } from 'lucide-react';

interface CompanySelectorProps {
  trackedSymbols: string[];
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  trackedSymbols,
  onAddSymbol,
  onRemoveSymbol,
}) => {
  const [inputSymbol, setInputSymbol] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const availableSuggestions = ALL_SUPPORTED_COMPANIES.filter(
    (c) => !trackedSymbols.includes(c.symbol)
  );

  const handleAdd = (sym: string) => {
    const target = sym.trim().toUpperCase();
    if (!target) return;

    if (trackedSymbols.includes(target)) {
      setErrorMessage(`Symbol ${target} is already tracked.`);
      return;
    }

    setErrorMessage('');
    onAddSymbol(target);
    setInputSymbol('');
  };

  return (
    <div className="company-selector-bar">
      <div className="tracked-tags">
        <span className="selector-label">Tracked:</span>
        {trackedSymbols.map((sym) => {
          const isIBM = sym === 'IBM';
          return (
            <span key={sym} className={`badge ${isIBM ? 'badge-primary' : 'badge-default'}`}>
              {sym}
              {!isIBM && (
                <button
                  className="badge-remove"
                  onClick={() => onRemoveSymbol(sym)}
                  aria-label={`Remove ${sym}`}
                >
                  <X size={12} />
                </button>
              )}
            </span>
          );
        })}
      </div>

      <div className="add-symbol-form">
        <input
          type="text"
          className="input-text"
          placeholder="Add ticker (e.g. GOOGL, AAPL)..."
          value={inputSymbol}
          onChange={(e) => {
            setInputSymbol(e.target.value);
            setErrorMessage('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd(inputSymbol);
            }
          }}
        />
        <button
          className="btn btn-secondary btn-sm flex items-center"
          onClick={() => handleAdd(inputSymbol)}
          disabled={!inputSymbol.trim()}
        >
          <Plus size={14} />
          <span style={{ marginLeft: 4 }}>Add</span>
        </button>

        {availableSuggestions.length > 0 && (
          <div className="quick-suggestions">
            <span className="suggestions-label">Suggestions:</span>
            {availableSuggestions.slice(0, 3).map((c) => (
              <button
                key={c.symbol}
                className="btn-chip"
                onClick={() => handleAdd(c.symbol)}
              >
                +{c.symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMessage && <p className="input-error-text">{errorMessage}</p>}
    </div>
  );
};
