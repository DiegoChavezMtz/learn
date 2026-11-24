import { toApiError } from './api-error';

type FetchOptions = RequestInit & { baseURL?: string; next?: { revalidate?: number | false; tags?: string[] } };

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { baseURL = '', ...init } = options;
  const res = await fetch(`${baseURL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, o?: FetchOptions) => request<T>(path, { ...o, method: 'GET' }),
  post: <T>(path: string, body: unknown, o?: FetchOptions) =>
    request<T>(path, { ...o, method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown, o?: FetchOptions) =>
    request<T>(path, { ...o, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, o?: FetchOptions) => request<T>(path, { ...o, method: 'DELETE' }),
};
