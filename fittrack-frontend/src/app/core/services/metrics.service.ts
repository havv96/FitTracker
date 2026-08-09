import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  WeeklyProgress,
  PersonalRecords,
  BodyMetrics,
  BodyMetricsRequest,
  AnalyticsSummary
} from '../models/metrics.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/metrics`;

  private analyticsSummary = signal<AnalyticsSummary | null>(null);
  private bodyMetricsHistory = signal<BodyMetrics[]>([]);

  get summary() {
    return this.analyticsSummary.asReadonly();
  }

  get bodyMetrics() {
    return this.bodyMetricsHistory.asReadonly();
  }

  getWeeklyProgress(weeksBack: number = 4): Observable<WeeklyProgress[]> {
    const params = new HttpParams().set('weeks', weeksBack.toString());
    return this.http.get<WeeklyProgress[]>(`${this.API_URL}/progress/weekly`, { params });
  }

  getPersonalRecords(): Observable<PersonalRecords[]> {
    return this.http.get<PersonalRecords[]>(`${this.API_URL}/personal-records`);
  }

  getBodyMetrics(startDate?: string, endDate?: string): Observable<BodyMetrics[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<BodyMetrics[]>(`${this.API_URL}/body-metrics`, { params }).pipe(
      tap(metrics => this.bodyMetricsHistory.set(metrics))
    );
  }

  addBodyMetrics(request: BodyMetricsRequest): Observable<BodyMetrics> {
    return this.http.post<BodyMetrics>(`${this.API_URL}/body-metrics`, request).pipe(
      tap(() => {
        this.getBodyMetrics().subscribe();
      })
    );
  }

  updateBodyMetrics(id: number, request: BodyMetricsRequest): Observable<BodyMetrics> {
    return this.http.put<BodyMetrics>(`${this.API_URL}/body-metrics/${id}`, request).pipe(
      tap(() => {
        this.getBodyMetrics().subscribe();
      })
    );
  }

  deleteBodyMetrics(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/body-metrics/${id}`).pipe(
      tap(() => {
        this.getBodyMetrics().subscribe();
      })
    );
  }

  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.API_URL}/summary`).pipe(
      tap(summary => this.analyticsSummary.set(summary))
    );
  }

  calculateWeightChange(metrics: BodyMetrics[]): { total: number; percentage: number } {
    if (metrics.length < 2) {
      return { total: 0, percentage: 0 };
    }

    const oldest = metrics[metrics.length - 1];
    const latest = metrics[0];

    const total = latest.weightKg - oldest.weightKg;
    const percentage = (total / oldest.weightKg) * 100;

    return {
      total: Math.round(total * 10) / 10,
      percentage: Math.round(percentage * 10) / 10
    };
  }

  calculateAverageWeight(metrics: BodyMetrics[]): number {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + m.weightKg, 0);
    return Math.round((total / metrics.length) * 10) / 10;
  }

  getWeightTrend(metrics: BodyMetrics[]): 'increasing' | 'decreasing' | 'stable' {
    if (metrics.length < 2) return 'stable';

    const recentMetrics = metrics.slice(0, Math.min(5, metrics.length));
    let increases = 0;
    let decreases = 0;

    for (let i = 0; i < recentMetrics.length - 1; i++) {
      if (recentMetrics[i].weightKg > recentMetrics[i + 1].weightKg) {
        increases++;
      } else if (recentMetrics[i].weightKg < recentMetrics[i + 1].weightKg) {
        decreases++;
      }
    }

    if (increases > decreases) return 'increasing';
    if (decreases > increases) return 'decreasing';
    return 'stable';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getDateRange(days: number): { startDate: string; endDate: string } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }
}
