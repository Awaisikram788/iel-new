import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StockData } from "../types/stock";

interface StockTableProps {
  stockData: Record<string, StockData>;
  symbols: string[];
}

interface TradeResult {
  check: string;
  long: string | null;
  short: string | null;
  difference: string | null;
}

export const StockTable: React.FC<StockTableProps> = ({
  stockData,
  symbols,
}) => {
  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  console.log(stockData);
  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getBgChangeColor = (change: number) => {
    if (change > 0) return "bg-green-50 border-green-200";
    if (change < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const checkTradeConditions = (
    symbol1: StockData,
    symbol2: StockData
  ): TradeResult => {
    const results: TradeResult = {
      check: "No Trade",
      long: null,
      short: null,
      difference: null,
    };

    console.log(symbol1);
    console.log(symbol2);

    // Check 1: symbol1 ask return < symbol2 bid return
    if (symbol1.askReturn < symbol2.bpReturn) {
      results.check = "Check 1";
      results.long = symbol1.symbol;
      results.short = symbol2.symbol;
      results.difference = (symbol2.bpReturn - symbol1.askReturn).toFixed(4);
      return results;
    }

    // Check 2: symbol2 ask return < symbol1 bid return
    if (symbol2.askReturn < symbol1.bpReturn) {
      results.check = "Check 2";
      results.long = symbol2.symbol;
      results.short = symbol1.symbol;
      results.difference = (symbol1.bpReturn - symbol2.askReturn).toFixed(4);
      return results;
    }

    return results;
  };

  // Generate trade decisions for symbol pairs
  const tradeDecisions: Record<string, TradeResult> = {};
  for (let i = 0; i < symbols.length - 1; i++) {
    const symbol1 = stockData[symbols[i]];
    const symbol2 = stockData[symbols[i + 1]];
    if (symbol1 && symbol2) {
      const result = checkTradeConditions(symbol1, symbol2);
      tradeDecisions[symbols[i]] = result;
      tradeDecisions[symbols[i + 1]] = result;
    }
  }

  if (symbols.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="text-gray-400 mb-2">
          <TrendingUp className="w-12 h-12 mx-auto mb-3" />
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No Symbols Selected
        </h3>
        <p className="text-gray-500">
          Add up to 2 stock symbols to start comparing live market data
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white text-center">
          Live Stock Comparison
          {symbols.slice(0, 1).map((symbol) => {
            const result = tradeDecisions[symbol];
            return (
              <div key={symbol} className="px-6 text-center">
                {result && stockData[symbol] ? (
                  <div className="flex justify-center items-center">
                    {result.check !== "No Trade" && (
                      <>
                        <div className="text-white">Long: {result.long}</div>
                        <div className="text-white ms-4">
                          Short: {result.short}
                        </div>
                        <div
                          className={`font-medium ms-4 ${
                            result.difference &&
                            parseFloat(result.difference) > 0
                              ? "text-white"
                              : "text-white"
                          }`}
                        >
                          Diff:{" "}
                          {result.difference ? `${result.difference}%` : "N/A"}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
            );
          })}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Metric
              </th>
              {symbols.map((symbol) => (
                <th
                  key={symbol}
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-700"
                >
                  {symbol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Current Price */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Current Price
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center">
                    {stock ? (
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-lg border transition-all duration-300 ${getBgChangeColor(
                          stock.change
                        )}`}
                      >
                        <span className="text-lg font-bold text-gray-900">
                          {formatNumber(stock.currentPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Change */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Change
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center">
                    {stock ? (
                      <div
                        className={`inline-flex items-center gap-1 ${getChangeColor(
                          stock.change
                        )}`}
                      >
                        {getChangeIcon(stock.change)}
                        <span className="font-semibold">
                          {stock.change > 0 ? "+" : ""}
                          {formatNumber(stock.change)}
                        </span>
                        <span className="text-xs">
                          ({stock.changePercent > 0 ? "+" : ""}
                          {formatNumber(stock.changePercent, 2)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Open Price */}
            {/* <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Open
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td
                    key={symbol}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {stock ? formatNumber(stock.openPrice) : "-"}
                  </td>
                );
              })}
            </tr> */}

            {/* High Price */}
            {/* <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                High
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td
                    key={symbol}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {stock ? formatNumber(stock.highPrice) : "-"}
                  </td>
                );
              })}
            </tr> */}

            {/* Low Price */}
            {/* <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Low
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td
                    key={symbol}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {stock ? formatNumber(stock.lowPrice) : "-"}
                  </td>
                );
              })}
            </tr> */}

            {/* Volume */}
            {/* <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Volume
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td
                    key={symbol}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {stock ? formatVolume(stock.volume) : "-"}
                  </td>
                );
              })}
            </tr> */}

            {/* Bid/Ask */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Bid / Ask
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center text-sm">
                    {stock ? (
                      <div className="space-y-1">
                        <div className="text-blue-600 font-medium">
                          {formatNumber(stock.bidPrice)}
                        </div>
                        <div className="text-red-600 font-medium">
                          {formatNumber(stock.askPrice)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Ask Volume / BP Volume
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center text-sm">
                    {stock ? (
                      <div className="space-y-1">
                        <div
                          className={`font-medium ${
                            stock.AskVolume && stock.AskVolume > 0
                              ? "text-green-600"
                              : stock.AskVolume && stock.AskVolume < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          Ask:{" "}
                          {stock.AskVolume
                            ? `${stock.AskVolume}`
                            : "N/A"}
                        </div>
                        <div
                          className={`font-medium ${
                            stock.BpVolume && stock.BpVolume > 0
                              ? "text-green-600"
                              : stock.BpVolume && stock.BpVolume < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          BP:{" "}
                          {stock.BpVolume
                            ? `${stock.BpVolume}`
                            : "N/A"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Ask Return / BP Return */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Ask Return / BP Return
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center text-sm">
                    {stock ? (
                      <div className="space-y-1">
                        <div
                          className={`font-medium ${
                            stock.askReturn && stock.askReturn > 0
                              ? "text-green-600"
                              : stock.askReturn && stock.askReturn < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          Ask:{" "}
                          {stock.askReturn
                            ? `${stock.askReturn.toFixed(4)}%`
                            : "N/A"}
                        </div>
                        <div
                          className={`font-medium ${
                            stock.bpReturn && stock.bpReturn > 0
                              ? "text-green-600"
                              : stock.bpReturn && stock.bpReturn < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          BP:{" "}
                          {stock.bpReturn
                            ? `${stock.bpReturn.toFixed(4)}%`
                            : "N/A"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Trade Decision */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Trade Decision
              </td>
              {symbols.slice(0, 1).map((symbol) => {
                const result = tradeDecisions[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center text-sm">
                    {result && stockData[symbol] ? (
                      <div className="space-y-1">
                        <div
                          className={`font-medium ${
                            result.check === "No Trade"
                              ? "text-gray-600"
                              : "text-blue-600"
                          }`}
                        >
                          {result.check}
                        </div>
                        {result.check !== "No Trade" && (
                          <>
                            <div className="text-gray-600">
                              Long: {result.long}
                            </div>
                            <div className="text-gray-600">
                              Short: {result.short}
                            </div>
                            <div
                              className={`font-medium ${
                                result.difference &&
                                parseFloat(result.difference) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              Diff:{" "}
                              {result.difference
                                ? `${result.difference}%`
                                : "N/A"}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Last Update */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-700">
                Last Update
              </td>
              {symbols.map((symbol) => {
                const stock = stockData[symbol];
                return (
                  <td key={symbol} className="px-6 py-4 text-center">
                    {stock ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-500">
                          {stock.lastUpdate}
                        </span>
                        {stock.isConnected && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
