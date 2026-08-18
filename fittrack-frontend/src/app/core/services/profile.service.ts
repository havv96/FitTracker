import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileRequest, ProfileResponse } from '../models/profile.model';
import { skipToastFor } from '../http/skip-error-toast';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  /**
   * Create or update user profile
   */
  createOrUpdateProfile(request: ProfileRequest): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`${environment.apiBaseUrl}/profile`, request);
  }

  /**
   * Get user profile.
   * 404 is an expected "no profile yet" signal for legacy accounts — suppress the global error toast
   * so the caller can transition to edit mode without a jarring alert.
   */
  getProfile(currentWeight?: number): Observable<ProfileResponse> {
    const params = currentWeight
      ? new HttpParams().set('currentWeight', currentWeight.toString())
      : undefined;
    return this.http.get<ProfileResponse>(`${environment.apiBaseUrl}/profile`, {
      params,
      context: skipToastFor(404),
    });
  }
}
