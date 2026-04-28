export interface AccountBalance {
  balance: number;
  lastUpdated: string;
}

export interface TradeEntry {
  id?: number;
  lots: number;
  entryTrade: number;
  profitLossAmount: number;
  timestamp?: string;
  exitTrade:number
  stockName:string
resultStatus: 'PROFIT' | 'LOSS';

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

export interface PersonTransaction {
  id?: number;
  personName: string;
  type: 'ADD' | 'WITHDRAW';

  amount: number;
  description?: string;
  date: string;
  timestamp?: string;
}

// (OPTIONAL - only if you use frontend summary)
export interface PersonSummary {
  name: string;
  totalAdded: number;
  totalWithdrawn: number;
  netBalance: number;
}

export interface ExpenseSummary {
  totalBalance: number;
  totalAdded: number;
  totalWithdrawn: number;
  totalPersons: number;
  personSummaries: PersonSummary[];
}