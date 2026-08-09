import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.model';

/**
 * Auth service. Access token lives in memory only. Refresh token is set by the backend
 * as an HttpOnly + Secure + SameSite=Strict cookie and never touched by JS.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private accessToken: string | null = null;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/register`,
      request,
      { withCredentials: true }
    ).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/login`,
      request,
      { withCredentials: true }
    ).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.http.post<void>(
      `${environment.apiBaseUrl}/auth/logout`,
      null,
      { withCredentials: true }
    ).subscribe({
      complete: () => this.clearLocalSession(),
      error: () => this.clearLocalSession()
    });
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiBaseUrl}/auth/refresh`,
      null,
      { withCredentials: true }
    ).pipe(
      tap(response => this.handleAuthResponse(response)),
      catchError(error => {
        this.clearLocalSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Called from APP_INITIALIZER on app boot. Attempts to hydrate a session from the
   * HttpOnly refresh cookie. Returns without erroring so the app can start even for
   * logged-out users.
   */
  restoreSession(): Observable<AuthResponse | null> {
    return this.refreshToken().pipe(
      catchError(() => of(null))
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.accessToken = response.accessToken;
    const user: User = {
      id: response.userId,
      email: response.email
    };
    this.currentUserSubject.next(user);
  }

  private clearLocalSession(): void {
    this.accessToken = null;
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
