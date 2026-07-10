import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// RTK Query's `error` is FetchBaseQueryError | SerializedError | undefined —
// only the former has a meaningful HTTP `status` (a number for real
// responses, or a string literal like 'FETCH_ERROR' for network failures).
export const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'status' in error) {
    const { status } = error as FetchBaseQueryError;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
};
