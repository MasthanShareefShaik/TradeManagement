import {  type AccountBalance, type PersonTransaction, type TradeEntry, type TradingNote, } from '../src/Parameters';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9090/';

class ApiService {
 private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // ✅ HANDLE 204 FIRST
  if (response.status === 204) {
    return null as T;
  }

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const error = await response.json();
      errorMessage = error.message;
    } catch {
      // no body
    }
    throw new Error(errorMessage);
  }

  return response.json();
}


async getTrades(): Promise<TradeEntry[]> {
  return this.request<TradeEntry[]>('trade');
}

async addTrade(trade: TradeEntry): Promise<TradeEntry> {
  return this.request<TradeEntry>('trade', {
    method: 'POST',
    body: JSON.stringify(trade),
  });
}


async updateTrade(id: number, trade: TradeEntry): Promise<TradeEntry> {
  return this.request<TradeEntry>(`trade/${id}`, {
    method: 'PUT',
    body: JSON.stringify(trade),
  });
}

async deleteTrade(id: number): Promise<void> {
  return this.request<void>(`trade/${id}`, {
    method: 'DELETE',
  });
}
async getNotes(): Promise<TradingNote[]> {
  return this.request<TradingNote[]>('notes');
}

async addNote(note: Partial<TradingNote>): Promise<TradingNote> {
  return this.request<TradingNote>('notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });
}

async updateNote(id: number, note: Partial<TradingNote>): Promise<TradingNote> {
  return this.request<TradingNote>(`notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });
}

async deleteNote(id: number): Promise<void> {
  return this.request<void>(`notes/${id}`, {
    method: 'DELETE',
  });
}
async getBalance(): Promise<AccountBalance> {
  return this.request<AccountBalance>('balance');
}

async updateBalance(amount: number): Promise<AccountBalance> {
  return this.request<AccountBalance>('balance/update', {
    method: 'POST',
    body: JSON.stringify(amount),
  });
}
async getTradesByDate(date: string): Promise<TradeEntry[]> {
  return this.request<TradeEntry[]>(`trade/by-date?date=${date}`);
}
async getNotesByDate(date: string): Promise<TradingNote[]> {
  return this.request<TradingNote[]>(`notes/by-date?date=${date}`);
}
// Expense APIs

async getExpenses() {
  return this.request("expenses");
}

async addExpense(data: PersonTransaction) {
  return this.request("expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

async updateExpense(id: number, data: PersonTransaction) {
  return this.request(`expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

async deleteExpense(id: number) {
  return this.request(`expenses/${id}`, {
    method: "DELETE",
  });
}

async getExpensesByDate(date: string) {
  return this.request(`expenses/by-date?date=${date}`);
}

async getExpensesByPerson(name: string) {
  return this.request(
    `expenses/by-person?personName=${encodeURIComponent(name)}`
  );
}
async downloadExpensesPdf() {
  const response = await fetch(`${API_BASE_URL}expenses/download`);
  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.pdf";
  a.click();
}
async downloadTradesPdf(date?: string) {
  const url = date
    ? `${API_BASE_URL}trade/download?date=${date}`
    : `${API_BASE_URL}trade/download`;

  const response = await fetch(url);
  const blob = await response.blob();

  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = "trades-report.pdf";
  a.click();
}
}

export const apiService = new ApiService();