import { type AccountBalance, type TradeEntry, } from '../src/Parameters';

const API_BASE_URL = 'http://localhost:9090/';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }



  async logout(): Promise<void> {
    this.clearToken();
  }

  // Account endpoints
  async getAccountBalance(): Promise<AccountBalance> {
    return this.request<AccountBalance>('/account/balance');
  }

  async updateBalance(amount: number): Promise<AccountBalance> {
    return this.request<AccountBalance>('/account/balance', {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  }

  // Trading endpoints
  async getTrades(): Promise<TradeEntry[]> {
    return this.request<TradeEntry[]>('/trades');
  }

  async addTrade(trade: TradeEntry): Promise<TradeEntry> {
    return this.request<TradeEntry>('/trades', {
      method: 'POST',
      body: JSON.stringify(trade),
    });
  }

  async updateTrade(id: number, trade: TradeEntry): Promise<TradeEntry> {
    return this.request<TradeEntry>(`/trades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(trade),
    });
  }

  async deleteTrade(id: number): Promise<void> {
    return this.request<void>(`/trades/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();