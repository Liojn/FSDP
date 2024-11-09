type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<T> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: T;
}

class Api {
  private static instance: Api;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  private async request<T, R>(endpoint: string, options: RequestOptions<T> = {}): Promise<{ data: R }> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return { data: await response.json() };
  }

  async get<R>(endpoint: string): Promise<{ data: R }> {
    return this.request<never, R>(endpoint, { method: 'GET' });
  }

  async post<T, R>(endpoint: string, data?: T): Promise<{ data: R }> {
    return this.request<T, R>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put<T, R>(endpoint: string, data: T): Promise<{ data: R }> {
    return this.request<T, R>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async patch<T, R>(endpoint: string, data: T): Promise<{ data: R }> {
    return this.request<T, R>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete<R>(endpoint: string): Promise<{ data: R }> {
    return this.request<never, R>(endpoint, { method: 'DELETE' });
  }
}

export const api = Api.getInstance();
