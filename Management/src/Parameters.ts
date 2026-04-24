export interface AccountBalance {
  balance: number;
  lastUpdated: string;
}

export interface TradeEntry {
  id?: number;
  lots: number;
  entryTrade: number;
  profitLoss: number;
  timestamp?: string;
  exitTrade:number
  stockName:string
}

export interface LoginCredentials {
  username: string;
  password: string;
}
export interface TradingNote {
  id: number;
  content: string;
  date: string;
  timestamp: string;
}