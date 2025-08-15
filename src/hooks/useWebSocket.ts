import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, StockData, StockTick } from '../types/stock';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [stockData, setStockData] = useState<Record<string, StockData>>({});
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket('ws://3.149.87.178:8000/ws/market/feed/');
      
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('WebSocket connected');
        
        // Re-subscribe to existing symbols
        subscribedSymbolsRef.current.forEach(symbol => {
          ws.send(JSON.stringify({ symbol }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.message === 'Subscribed to' || message.message.includes('Subscribed')) {
            console.log('Subscription confirmed:', message.message);
            return;
          }

          if (message.message === 'Received tick' && message.data?.data) {
            const tickData: StockTick = message.data.data;
            
            setStockData(prev => ({
              ...prev,
              [tickData.s]: {
                symbol: tickData.s,
                currentPrice: tickData.c,
                openPrice: tickData.o,
                highPrice: tickData.h,
                lowPrice: tickData.l,
                volume: tickData.v,
                change: tickData.ch,
                changePercent: tickData.pch,
                bidPrice: tickData.bp,
                askPrice: tickData.ap,
                lastUpdate: tickData.formatted_time || new Date().toLocaleTimeString(),
                isConnected: true
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        
        // Mark all stocks as disconnected
        setStockData(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(symbol => {
            updated[symbol] = { ...updated[symbol], isConnected: false };
          });
          return updated;
        });

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed. Retrying...');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect to market feed');
    }
  }, []);

  const subscribe = useCallback((symbol: string) => {
    if (!symbol.trim()) return;
    
    const upperSymbol = symbol.toUpperCase().trim();
    subscribedSymbolsRef.current.add(upperSymbol);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ symbol: upperSymbol }));
    }
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    subscribedSymbolsRef.current.delete(upperSymbol);
    
    setStockData(prev => {
      const updated = { ...prev };
      delete updated[upperSymbol];
      return updated;
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    stockData,
    connectionError,
    subscribe,
    unsubscribe,
    reconnect: connect
  };
};