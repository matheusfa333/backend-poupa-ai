import { Injectable, Logger } from '@nestjs/common';

export type PluggyAccount = {
  id: string;
  itemId: string;
  name: string;
  type: string;
  subtype: string;
  number: string;
  balance: number;
  currencyCode: string;
};

export type PluggyTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string | null;
  currencyCode: string;
};

export type PluggyItemData = {
  id: string;
  connector: { id: number; name: string };
  status: string;
  executionStatus: string;
};

const PLUGGY_BASE_URL = 'https://api.pluggy.ai';

@Injectable()
export class PluggyApiService {
  private readonly logger = new Logger(PluggyApiService.name);
  private apiKey: string | null = null;
  private apiKeyExpiry: Date | null = null;

  private async getApiKey(): Promise<string> {
    if (this.apiKey && this.apiKeyExpiry && this.apiKeyExpiry > new Date()) {
      return this.apiKey;
    }

    const res = await fetch(`${PLUGGY_BASE_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pluggy auth failed: ${err}`);
    }

    const data = await res.json();
    this.apiKey = data.apiKey as string;
    this.apiKeyExpiry = new Date(Date.now() + 25 * 60 * 1000);
    return this.apiKey as string;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const apiKey = await this.getApiKey();
    const res = await fetch(`${PLUGGY_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pluggy API error ${res.status}: ${err}`);
    }

    return res.json();
  }

  async createConnectToken(clientUserId: string, itemId?: string): Promise<string> {
    const body: Record<string, unknown> = { clientUserId };
    if (itemId) body.itemId = itemId;

    const data = await this.request<{ accessToken: string }>('/connect_token', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return data.accessToken;
  }

  async getItem(itemId: string): Promise<PluggyItemData> {
    return this.request<PluggyItemData>(`/items/${itemId}`);
  }

  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    const data = await this.request<{ results: PluggyAccount[] }>(`/accounts?itemId=${itemId}`);
    return data.results;
  }

  async getTransactions(accountId: string, from?: Date): Promise<PluggyTransaction[]> {
    let url = `/transactions?accountId=${accountId}&pageSize=500`;
    if (from) {
      const fromStr = from.toISOString().split('T')[0];
      url += `&from=${fromStr}`;
    }

    const data = await this.request<{ results: PluggyTransaction[]; total: number }>(url);
    return data.results;
  }
}
