import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  DailyStats,
  WeeklyProgress,
  MonthlyProgress,
  ProgressChartData,
  PersonalRecords,
  BodyMetrics,
  BodyMetricsRequest,
  AnalyticsSummary,
  DateRangeRequest
} from '../models/metrics.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/metrics`;

  // State management
  private analyticsSummary = signal<AnalyticsSummary | null>(null);
  private bodyMetricsHistory = signal<BodyMetrics[]>([]);
  private progressData = signal<ProgressChartData | null>(null);

  // Public getters
  get summary() {
    return this.analyticsSummary.asReadonly();
  }

  get bodyMetrics() {
    return this.bodyMetricsHistory.asReadonly();
  }

  get chartData() {
    return this.progressData.asReadonly();
  }

  // Daily Stats Operations
  getDailyStats(date: string): Observable<DailyStats> {
    return this.http.get<DailyStats>(`${this.API_URL}/daily/${date}`);
  }

  getStatsRange(startDate: string, endDate: string): Observable<DailyStats[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DailyStats[]>(`${this.API_URL}/daily/range`, { params });
  }

  // Progress Tracking
  getWeeklyProgress(weeksBack: number = 4): Observable<WeeklyProgress[]> {
    const params = new HttpParams().set('weeks', weeksBack.toString());
    return this.http.get<WeeklyProgress[]>(`${this.API_URL}/progress/weekly`, { params });
  }

  getMonthlyProgress(monthsBack: number = 6): Observable<MonthlyProgress[]> {
    const params = new HttpParams().set('months', monthsBack.toString());
    return this.http.get<MonthlyProgress[]>(`${this.API_URL}/progress/monthly`, { params });
  }

  getProgressChart(startDate: string, endDate: string): Observable<ProgressChartData> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<ProgressChartData>(`${this.API_URL}/progress/chart`, { params }).pipe(
      tap(data => this.progressData.set(data))
    );
  }

  // Personal Records
  getPersonalRecords(): Observable<PersonalRecords[]> {
    return this.http.get<PersonalRecords[]>(`${this.API_URL}/personal-records`);
  }

  getExercisePersonalRecord(exerciseId: number): Observable<PersonalRecords> {
    return this.http.get<PersonalRecords>(`${this.API_URL}/personal-records/${exerciseId}`);
  }

  // Body Metrics
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
        // Refresh body metrics
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

  // Analytics Summary
  getAnalyticsSummary(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${this.API_URL}/summary`).pipe(
      tap(summary => this.analyticsSummary.set(summary))
    );
  }

  // Streak & Consistency
  getCurrentStreak(): Observable<{ currentStreak: number; bestStreak: number }> {
    return this.http.get<{ currentStreak: number; bestStreak: number }>(`${this.API_URL}/streak`);
  }

  getConsistencyRate(days: number = 30): Observable<{ rate: number; workoutDays: number; totalDays: number }> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<{ rate: number; workoutDays: number; totalDays: number }>(
      `${this.API_URL}/consistency`,
      { params }
    );
  }

  // Helper Methods
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
