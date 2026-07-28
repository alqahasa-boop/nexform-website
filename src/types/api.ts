/** Standard success/error envelope every API route + server action should return. */
export type ApiResult<T> = { success: true; data: T } | { success: false; error: string; code?: string };

export function apiSuccess<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function apiError(error: string, code?: string): ApiResult<never> {
  return { success: false, error, code };
}

/** Standard pagination envelope for list endpoints. */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export function buildPagination(total: number, { page = 1, pageSize = 20 }: PaginationParams) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    meta: { total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}
