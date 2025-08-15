export interface StockTick {
  m: string;
  st: string;
  s: string;
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  ldcp: number;
  ch: number;
  pch: number;
  bp: number;
  bv: number;
  ap: number;
  av: number;
  val: number;
  tr: number;
  lt: string | null;
  ask_return: number;
  bp_return: number;
  formatted_time: string;
}

export interface WebSocketMessage {
  message: string;
  data?: {
    type: string;
    data: StockTick;
  };
}

export interface StockData {
  symbol: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  change: number;
  changePercent: number;
  bidPrice: number;
  askPrice: number;
  lastUpdate: string;
  isConnected: boolean;
}