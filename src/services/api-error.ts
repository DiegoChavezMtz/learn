export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function toApiError(res: Response): Promise<ApiError> {
  let body: { message?: string; code?: string } = {};
  try { body = await res.json(); } catch { /* sin body JSON */ }
  return new ApiError(res.status, body.message ?? res.statusText ?? 'Error de red', body.code, body);
}
