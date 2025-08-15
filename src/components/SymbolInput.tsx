import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface SymbolInputProps {
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (symbol: string) => void;
  subscribedSymbols: string[];
  maxSymbols?: number;
}

export const SymbolInput: React.FC<SymbolInputProps> = ({
  onAddSymbol,
  onRemoveSymbol,
  subscribedSymbols,
  maxSymbols = 2
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = inputValue.toUpperCase().trim();
    
    if (!symbol) return;
    if (subscribedSymbols.includes(symbol)) return;
    if (subscribedSymbols.length >= maxSymbols) return;

    onAddSymbol(symbol);
    setInputValue('');
  };

  const canAddMore = subscribedSymbols.length < maxSymbols;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Stock Symbols</h2>
      
      {/* Subscribed Symbols */}
      <div className="flex flex-wrap gap-2 mb-4">
        {subscribedSymbols.map(symbol => (
          <div
            key={symbol}
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200"
          >
            <span className="font-medium">{symbol}</span>
            <button
              onClick={() => onRemoveSymbol(symbol)}
              className="hover:bg-blue-100 rounded-full p-1 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Symbol Form */}
      {canAddMore && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter symbol (e.g., OGDC, PPL)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            maxLength={10}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500 italic">
          Maximum {maxSymbols} symbols allowed. Remove a symbol to add another.
        </p>
      )}
    </div>
  );
};