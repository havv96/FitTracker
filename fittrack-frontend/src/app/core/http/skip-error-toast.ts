import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Per-request opt-out for the global error toast. When a request's HttpContext
 * carries this token set to a list of status codes, `errorInterceptor` will not
 * surface a toast for those statuses (the error still propagates to the caller).
 * Use for expected 4xx responses that the caller handles inline — e.g. a 404
 * from GET /profile meaning "no profile yet, show setup form".
 */
export const SKIP_ERROR_TOAST_STATUSES = new HttpContextToken<number[]>(() => []);

export function skipToastFor(...statuses: number[]): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST_STATUSES, statuses);
}
