// Assuming the buttons are in a parent component or a separate file
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";
import { StockData } from "../types/stock";
import { useLocation } from "react-router-dom";

interface TradeResult {
  check: string;
  long: string | null;
  short: string | null;
  difference: string | null;
}

// Define stock pair arrays
const stockPairs = [
  ["GLAXO", "UNITY"],
  ["GLAXO", "PPL"],
  ["FCEPL", "FFL"],
  ["FFL", "SNGP"],
  ["OGDC", "SYS"],
  ["CPHL", "SEARL"],
  ["FCCL", "FFL"],
  ["CNERGY", "FFL"],
  ["FCCL", "POWER"],
  ["FFL", "PAEL"],
  ["AGP", "GLAXO"],
  ["FCCL", "SNGP"],
  ["FCCL", "FEROZ"],
  ["PPL", "UNITY"],
  ["AGP", "LUCK"],
  ["FEROZ", "SNGP"],
  ["HUBC", "SAZEW"],
  ["PSO", "SYS"],
  ["DGKC", "PAEL"],
  ["SYS", "UNITY"],
  ["OGDC", "UNITY"],
  ["ATRL", "CNERGY"],
  ["FFL", "POWER"],
  ["PSO", "UNITY"],
  ["NBP", "SYS"],
];

const stockPairs200 = [
  ["OGDC", "PPL"],
  ["PPL", "PSO"],
  ["NRL", "PRL"],
  ["AVN", "OCTOPUS"],
];

const stockPairs100 = [
  ["PPL", "PSO"],
  ["OGDC", "PSO"],
  ["OGDC", "PPL"],
  ["GAL", "GHNI"],
  ["NRL", "PRL"],
  ["FCCL", "POWER"],
];

const stockPairs65 = [
  ["PPL", "PSO"],
  ["OGDC", "PPL"],
  ["OGDC", "PSO"],
  ["GAL", "GHNI"],
  ["GLAXO", "PPL"],
  ["FCCL", "POWER"],
  ["FFL", "SNGP"],
  ["FCEPL", "FFL"],
  ["OGDC", "SYS"],
  ["FFL", "PAEL"],
  ["CNERGY", "FFL"],
  ["GLAXO", "UNITY"],
  ["AGP", "GLAXO"],
  ["CPHL", "SEARL"],
  ["DFML", "SSGC"],
  ["DGKC", "PAEL"],
  ["FEROZ", "SNGP"],
  ["NBP", "SYS"],
];

// Map stock pair types to their respective arrays
const stockPairMap = {
  default: stockPairs,
  "200": stockPairs200,
  "100": stockPairs100,
  "65": stockPairs65,
};

export const StockDifferenceTable: React.FC = () => {
  const { isConnected, stockData, subscribe, unsubscribe } = useWebSocket();
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const location = useLocation();

  // Get the stock pair type from the query parameter
  const queryParams = new URLSearchParams(location.search);
  const stockPairType = queryParams.get("type") || "default";

  // Select the appropriate stock pair array
  const selectedStockPairs = stockPairMap[stockPairType as keyof typeof stockPairMap] || stockPairs;

  // Subscribe to all symbols in the selected stock pairs on mount
  useEffect(() => {
    const symbols = Array.from(new Set(selectedStockPairs.flat()));
    symbols.forEach((symbol) => subscribe(symbol));
    setSubscribedSymbols(symbols);

    return () => {
      symbols.forEach((symbol) => unsubscribe(symbol));
    };
  }, [subscribe, unsubscribe, selectedStockPairs]);

  const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
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

    if (symbol1.askReturn < symbol2.bpReturn) {
      results.check = "Check 1";
      results.long = symbol1.symbol;
      results.short = symbol2.symbol;
      results.difference = (symbol2.bpReturn - symbol1.askReturn).toFixed(4);
      return results;
    }

    if (symbol2.askReturn < symbol1.bpReturn) {
      results.check = "Check 2";
      results.long = symbol2.symbol;
      results.short = symbol1.symbol;
      results.difference = (symbol1.bpReturn - symbol2.askReturn).toFixed(4);
      return results;
    }

    return results;
  };

  const tradeDecisions: Record<string, TradeResult> = {};
  selectedStockPairs.forEach(([symbol1, symbol2]) => {
    const stock1 = stockData[symbol1];
    const stock2 = stockData[symbol2];
    if (stock1 && stock2) {
      const result = checkTradeConditions(stock1, stock2);
      tradeDecisions[`${symbol1}-${symbol2}`] = result;
    }
  });

  // Sort stock pairs based on difference
  const sortedStockPairs = [...selectedStockPairs].sort((a, b) => {
    if (!sortOrder) return 0;

    const tradeResultA = tradeDecisions[`${a[0]}-${a[1]}`] || {
      difference: null,
    };
    const tradeResultB = tradeDecisions[`${b[0]}-${b[1]}`] || {
      difference: null,
    };

    const diffA = tradeResultA.difference
      ? parseFloat(tradeResultA.difference)
      : -Infinity;
    const diffB = tradeResultB.difference
      ? parseFloat(tradeResultB.difference)
      : -Infinity;

    if (sortOrder === "asc") {
      return diffA - diffB;
    } else {
      return diffB - diffA;
    }
  });

  const handleSort = () => {
    setSortOrder((prev) => {
      if (!prev) return "desc";
      return prev === "desc" ? "asc" : "desc";
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stock Difference Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Compare price differences and trade decisions for stock pairs
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="text-gray-600">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Stock Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="py-3 px-4 text-left">Stock 1</th>
                <th className="py-3 px-4 text-left">Stock 2</th>
                <th
                  className="py-3 px-4 text-left cursor-pointer"
                  onClick={handleSort}
                >
                  Trade Decision{" "}
                  {sortOrder === "desc" ? "↓" : sortOrder === "asc" ? "↑" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStockPairs.map(([symbol1, symbol2]) => {
                const stock1 = stockData[symbol1];
                const stock2 = stockData[symbol2];
                const tradeResult = tradeDecisions[`${symbol1}-${symbol2}`] || {
                  check: "No Trade",
                  long: null,
                  short: null,
                  difference: null,
                };
                const priceDiff =
                  stock1 && stock2
                    ? (stock1.currentPrice - stock2.currentPrice).toFixed(2)
                    : "N/A";

                return (
                  <tr
                    key={`${symbol1}-${symbol2}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      {stock1 ? (
                        <div className="flex items-center gap-2">
                          <span>{symbol1}</span>
                        </div>
                      ) : (
                        symbol1
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {stock2 ? (
                        <div className="flex items-center gap-2">
                          <span>{symbol2}</span>
                        </div>
                      ) : (
                        symbol2
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div
                          className={`font-medium ${
                            tradeResult.check === "No Trade"
                              ? "text-gray-600"
                              : "text-blue-600"
                          }`}
                        >
                          {tradeResult.check}
                        </div>
                        {tradeResult.check !== "No Trade" && (
                          <>
                            <div className="text-gray-600">
                              Long: {tradeResult.long}
                            </div>
                            <div className="text-gray-600">
                              Short: {tradeResult.short}
                            </div>
                            <div
                              className={`font-medium ${
                                parseFloat(tradeResult.difference || "0") > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              Diff:{" "}
                              {tradeResult.difference
                                ? `${tradeResult.difference}%`
                                : "N/A"}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};