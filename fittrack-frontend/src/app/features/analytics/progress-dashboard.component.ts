import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MetricsService } from '../../core/services/metrics.service';
import { WorkoutService } from '../../core/services/workout.service';
import { NutritionService } from '../../core/services/nutrition.service';
import {
  AnalyticsSummary,
  WeeklyProgress,
  BodyMetrics
} from '../../core/models/metrics.model';
import { BodyMetricsModalComponent } from './body-metrics-modal.component';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BodyMetricsModalComponent],
  template: `
    <div class="progress-dashboard-container">
      <!-- Header -->
      <div class="header">
        <h2>Progress & Analytics</h2>
        <p class="subtitle">Track your fitness journey and achievements</p>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="loading">
        <p>Loading your progress...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="error-banner">
        {{ error() }}
        <button (click)="error.set(null)" class="btn-close">×</button>
      </div>

      <!-- Summary Cards -->
      <div *ngIf="!loading() && summary()" class="summary-section">
        <div class="stat-card-grid">
          <div class="stat-card primary">
            <div class="stat-icon">🏋️</div>
            <div class="stat-content">
              <div class="stat-value">{{ summary()!.totalWorkouts }}</div>
              <div class="stat-label">Total Workouts</div>
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-icon">💪</div>
            <div class="stat-content">
              <div class="stat-value">{{ formatVolume(summary()!.totalVolume) }}</div>
              <div class="stat-label">Total Volume</div>
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">{{ summary()!.consistencyStreak }}</div>
              <div class="stat-label">Current Streak</div>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-value">{{ summary()!.avgWorkoutDuration }}m</div>
              <div class="stat-label">Avg Duration</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Progress -->
      <div *ngIf="weeklyProgress().length > 0" class="section">
        <h3>Weekly Progress</h3>
        <div class="progress-cards">
          <div *ngFor="let week of weeklyProgress()" class="progress-card">
            <div class="progress-header">
              <span class="week-label">{{ formatWeek(week.weekStartDate) }}</span>
              <span class="workout-count">{{ week.workoutCount }} workouts</span>
            </div>
            <div class="progress-stats">
              <div class="progress-stat">
                <span class="label">Volume:</span>
                <span class="value">{{ formatVolume(week.totalVolume) }}</span>
              </div>
              <div class="progress-stat">
                <span class="label">Avg Duration:</span>
                <span class="value">{{ week.avgWorkoutDuration }}m</span>
              </div>
              <div class="progress-stat">
                <span class="label">Calories:</span>
                <span class="value">{{ week.caloriesConsumed }} kcal</span>
              </div>
              <div class="progress-stat">
                <span class="label">Compliance:</span>
                <span class="value">{{ week.complianceRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Records -->
      <div *ngIf="summary() && summary()!.personalRecords.length > 0" class="section">
        <h3>Personal Records</h3>
        <div class="records-grid">
          <div *ngFor="let record of summary()!.personalRecords" class="record-card">
            <div class="record-icon">🏆</div>
            <div class="record-info">
              <h4>{{ record.exerciseName }}</h4>
              <div class="record-details">
                <span class="record-value">{{ record.bestWeight }} kg</span>
                <span class="record-label">× {{ record.bestReps }} reps</span>
              </div>
              <div class="record-date">{{ formatDate(record.achievedDate) }}</div>
            </div>
          </div>

          <div *ngIf="summary()!.personalRecords.length === 0" class="no-records">
            <p>No personal records yet. Keep pushing!</p>
            <button routerLink="/workout/session" class="btn-primary">Start Workout</button>
          </div>
        </div>
      </div>

      <!-- Body Metrics -->
      <div *ngIf="bodyMetrics().length > 0" class="section">
        <div class="section-header">
          <h3>Body Metrics</h3>
          <button (click)="showAddMetrics()" class="btn-secondary">+ Add Entry</button>
        </div>

        <div class="metrics-chart">
          <div class="weight-summary">
            <div class="summary-item">
              <span class="label">Current Weight:</span>
              <span class="value highlight">{{ bodyMetrics()[0]?.weightKg }} kg</span>
            </div>
            <div class="summary-item">
              <span class="label">Change:</span>
              <span class="value" [class]="getWeightChangeClass()">
                {{ weightChange().total >= 0 ? '+' : '' }}{{ weightChange().total }} kg
                ({{ weightChange().percentage >= 0 ? '+' : '' }}{{ weightChange().percentage }}%)
              </span>
            </div>
            <div class="summary-item">
              <span class="label">Trend:</span>
              <span class="value">{{ getTrendEmoji() }} {{ weightTrend() }}</span>
            </div>
          </div>

          <div class="metrics-list">
            <div *ngFor="let metric of bodyMetrics()" class="metric-row">
              <span class="metric-date">{{ formatDate(metric.date) }}</span>
              <span class="metric-weight">{{ metric.weightKg }} kg</span>
              <span *ngIf="metric.bodyFatPercentage" class="metric-bf">
                BF: {{ metric.bodyFatPercentage }}%
              </span>
              <div class="metric-actions">
                <button (click)="showEditMetrics(metric)" class="btn-icon-small" title="Edit">✏️</button>
                <button (click)="deleteMetric(metric.id)" class="btn-icon-small" title="Delete">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && !summary()" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>No Data Yet</h3>
        <p>Start tracking your workouts and nutrition to see your progress!</p>
        <div class="empty-actions">
          <button routerLink="/workout/session" class="btn-primary">Start Workout</button>
          <button routerLink="/nutrition" class="btn-secondary">Log Nutrition</button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button routerLink="/workout/history" class="action-btn">
            📈 View Workout History
          </button>
          <button routerLink="/nutrition" class="action-btn">
            🍎 Track Nutrition
          </button>
          <button (click)="showAddMetrics()" class="action-btn">
            ⚖️ Log Body Weight
          </button>
          <button routerLink="/profile" class="action-btn">
            👤 Update Profile
          </button>
        </div>
      </div>

      <!-- Body Metrics Modal -->
      <app-body-metrics-modal
        *ngIf="showModal()"
        [existingMetric]="editingMetric()"
        (saved)="onMetricsSaved()"
        (cancelled)="onModalCancelled()"
      ></app-body-metrics-modal>
    </div>
  `,
  styles: [`
    .progress-dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 40px;
    }

    .header h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 32px;
    }

    .subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .error-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d32f2f;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 400px;
      z-index: 1000;
    }

    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .summary-section {
      margin-bottom: 40px;
    }

    .stat-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }

    .stat-card.primary {
      border-color: #4CAF50;
    }

    .stat-card.success {
      border-color: #2196F3;
    }

    .stat-card.warning {
      border-color: #FF9800;
    }

    .stat-card.info {
      border-color: #9C27B0;
    }

    .stat-icon {
      font-size: 48px;
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .section h3 {
      margin: 0 0 24px 0;
      color: #333;
      font-size: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h3 {
      margin: 0;
    }

    .progress-cards {
      display: grid;
      gap: 20px;
    }

    .progress-card {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e0e0e0;
    }

    .week-label {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }

    .workout-count {
      color: #4CAF50;
      font-weight: 500;
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .progress-stat {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }

    .progress-stat .label {
      color: #666;
      font-size: 14px;
    }

    .progress-stat .value {
      color: #333;
      font-weight: 600;
      font-size: 14px;
    }

    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .record-card {
      background: linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%);
      border-radius: 8px;
      padding: 20px;
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .record-icon {
      font-size: 40px;
    }

    .record-info {
      flex: 1;
    }

    .record-info h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 16px;
    }

    .record-details {
      display: flex;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 4px;
    }

    .record-value {
      font-size: 20px;
      font-weight: bold;
      color: #F57C00;
    }

    .record-label {
      color: #666;
      font-size: 14px;
    }

    .record-date {
      color: #999;
      font-size: 12px;
    }

    .no-records {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .metrics-chart {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .weight-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .summary-item .label {
      color: #666;
      font-size: 14px;
    }

    .summary-item .value {
      color: #333;
      font-size: 24px;
      font-weight: bold;
    }

    .summary-item .value.highlight {
      color: #4CAF50;
    }

    .summary-item .value.positive {
      color: #4CAF50;
    }

    .summary-item .value.negative {
      color: #f44336;
    }

    .metrics-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .metric-row {
      display: grid;
      grid-template-columns: 120px 100px 1fr auto;
      gap: 15px;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .metric-row:hover {
      background: #f0f0f0;
    }

    .metric-date {
      color: #666;
      font-size: 14px;
    }

    .metric-weight {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }

    .metric-bf {
      color: #666;
      font-size: 14px;
    }

    .metric-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon-small {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      opacity: 0.6;
      transition: opacity 0.3s;
    }

    .btn-icon-small:hover {
      opacity: 1;
    }

    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 24px;
    }

    .empty-state p {
      color: #666;
      margin: 0 0 30px 0;
    }

    .empty-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .quick-actions-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .quick-actions-section h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .action-btn {
      background: #f5f5f5;
      border: 2px solid #e0e0e0;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      transition: all 0.3s;
      text-align: left;
    }

    .action-btn:hover {
      background: white;
      border-color: #4CAF50;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-primary:hover {
      background: #45a049;
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      border-color: #999;
      color: #333;
    }

    @media (max-width: 768px) {
      .stat-card-grid {
        grid-template-columns: 1fr;
      }

      .weight-summary {
        grid-template-columns: 1fr;
      }

      .metric-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProgressDashboardComponent implements OnInit {
  private metricsService = inject(MetricsService);
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);

  // State
  summary = signal<AnalyticsSummary | null>(null);
  weeklyProgress = signal<WeeklyProgress[]>([]);
  bodyMetrics = signal<BodyMetrics[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showModal = signal<boolean>(false);
  editingMetric = signal<BodyMetrics | undefined>(undefined);

  // Computed
  weightChange = computed(() => {
    const metrics = this.bodyMetrics();
    return this.metricsService.calculateWeightChange(metrics);
  });

  weightTrend = computed(() => {
    return this.metricsService.getWeightTrend(this.bodyMetrics());
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);

    // Load analytics summary
    this.metricsService.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.weeklyProgress.set(data.recentProgress || []);
        this.bodyMetrics.set(data.bodyMetrics || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load progress data');
        this.loading.set(false);
        console.error('Error loading analytics:', err);
      }
    });
  }

  formatVolume(volume: number): string {
    if (volume >= 1000) {
      return `${Math.round(volume / 100) / 10}k kg`;
    }
    return `${Math.round(volume)} kg`;
  }

  formatWeek(dateString: string): string {
    const date = new Date(dateString);
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getWeightChangeClass(): string {
    const change = this.weightChange().total;
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return '';
  }

  getTrendEmoji(): string {
    const trend = this.weightTrend();
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  }

  showAddMetrics(): void {
    this.editingMetric.set(undefined);
    this.showModal.set(true);
  }

  showEditMetrics(metric: BodyMetrics): void {
    this.editingMetric.set(metric);
    this.showModal.set(true);
  }

  onMetricsSaved(): void {
    this.showModal.set(false);
    this.editingMetric.set(undefined);
    this.loadAllData();
  }

  onModalCancelled(): void {
    this.showModal.set(false);
    this.editingMetric.set(undefined);
  }

  deleteMetric(id: number): void {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    this.metricsService.deleteBodyMetrics(id).subscribe({
      next: () => {
        this.loadAllData();
      },
      error: (err) => {
        this.error.set('Failed to delete metric');
        console.error('Error deleting metric:', err);
      }
    });
  }
}
