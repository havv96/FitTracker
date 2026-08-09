import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

/**
 * Attaches the in-memory access token as a Bearer header and enables credentialed requests
 * so the HttpOnly refresh cookie is sent to /auth/refresh. On 401 (only), tries a refresh
 * and retries the original request; if refresh fails, propagates the error.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Skip token injection for auth endpoints. They already ride on withCredentials from the service.
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/logout');

  let authReq = req.clone({ withCredentials: true });
  if (token && !isAuthEndpoint) {
    authReq = authReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            const retryReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            });
            return next(retryReq);
          }),
          catchError(refreshError => throwError(() => refreshError))
        );
      }
      return throwError(() => error);
    })
  );
};
