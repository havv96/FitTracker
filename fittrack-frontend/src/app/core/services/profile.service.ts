import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileRequest, ProfileResponse } from '../models/profile.model';

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
   * Get user profile
   */
  getProfile(currentWeight?: number): Observable<ProfileResponse> {
    const options = currentWeight ? { params: { currentWeight: currentWeight.toString() } } : {};
    return this.http.get<ProfileResponse>(`${environment.apiBaseUrl}/profile`, options);
  }
}
