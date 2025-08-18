import React from "react";
import { Link } from "react-router-dom";
import { useWebSocket } from "../hooks/useWebSocket";
import { ConnectionStatus } from "./ConnectionStatus";
import { SymbolInput } from "./SymbolInput";
import { StockTable } from "./StockTable";
import { BarChart3 } from "lucide-react";

export const Dashboard: React.FC = () => {
  const {
    isConnected,
    stockData,
    connectionError,
    subscribe,
    unsubscribe,
    reconnect,
  } = useWebSocket();

  const subscribedSymbols = Object.keys(stockData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stock Comparison Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Compare live market data for up to 2 stocks side by side
          </p>
        </div>
        <div className="absolute top-10 right-10">
          <Link to={"/difference"}>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md">
              List of Stocks
            </button>
          </Link>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <ConnectionStatus
            isConnected={isConnected}
            error={connectionError}
            onReconnect={reconnect}
          />
        </div>

        {/* Symbol Input */}
        <div className="mb-8">
          <SymbolInput
            onAddSymbol={subscribe}
            onRemoveSymbol={unsubscribe}
            subscribedSymbols={subscribedSymbols}
            maxSymbols={2}
          />
        </div>

        {/* Stock Data Table */}
        <StockTable stockData={stockData} symbols={subscribedSymbols} />

        {/* Instructions */}
        {subscribedSymbols.length === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Getting Started
            </h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Enter up to 2 stock symbols (e.g., OGDC, PPL, BATA)</li>
              <li>• Watch live price updates in real-time</li>
              <li>• Compare performance side by side</li>
              <li>• Monitor bid/ask spreads and volume</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
