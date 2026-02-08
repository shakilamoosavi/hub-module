// BaseService.ts
// Handles all HTTP logic and is extended by other services

export class BaseHttpService {
  baseUrl: string;

  constructor() {
    // Use stage URL if NODE_ENV is not production
    this.baseUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_BASE_URL!
        : process.env.NEXT_PUBLIC_API_BASE_URL_STAGE!;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    // Get locale from browser or fallback
    let lang = (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0])) || 'en';
    // Get user-agent from browser if available
    let userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    // Get JWT from localStorage (or you can use context if you have it)
    let jwt = '';
    if (typeof window !== 'undefined') {
      jwt = localStorage.getItem('jwt') || '';
    }
    // Merge headers, but do not override if user sets 'authorization'
    const userHeaders = options.headers || {};
    let userHeadersObj: Record<string, string> = {};
    if (userHeaders instanceof Headers) {
      userHeaders.forEach((value, key) => {
        userHeadersObj[key] = value;
      });
    } else if (typeof userHeaders === 'object' && userHeaders !== null) {
      userHeadersObj = userHeaders as Record<string, string>;
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'lang': lang,
      'user-agent': userAgent,
      ...userHeadersObj,
    };
    if (!('authorization' in (userHeaders as any)) && jwt) {
      headers['authorization'] = `Bearer ${jwt}`;
    }
    const res = await fetch(url, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw { status: res.status, ...error };
    }
    return res.json();
  }
}
