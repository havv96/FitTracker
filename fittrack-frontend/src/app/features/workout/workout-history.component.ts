import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutHistoryResponse, WorkoutDetailResponse } from '../../core/models/workout.model';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="workout-history-container">
      <div class="header">
        <h2>Workout History</h2>
        <p class="subtitle">View your past workouts and track your progress</p>
      </div>

      <!-- Date Range Selector -->
      <div class="date-selector">
        <div class="quick-filters">
          <button
            *ngFor="let filter of quickFilters"
            (click)="selectQuickFilter(filter.value)"
            [class.active]="selectedFilter() === filter.value"
            class="filter-btn"
          >
            {{ filter.label }}
          </button>
        </div>

        <div class="custom-range">
          <label>Custom Range:</label>
          <input
            type="date"
            [(ngModel)]="startDate"
            (change)="onDateChange()"
            class="date-input"
          />
          <span>to</span>
          <input
            type="date"
            [(ngModel)]="endDate"
            (change)="onDateChange()"
            class="date-input"
          />
          <button (click)="loadHistory()" class="btn-primary">Apply</button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div *ngIf="workouts().length > 0" class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalWorkouts() }}</div>
          <div class="stat-label">Total Workouts</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalVolume() }} kg</div>
          <div class="stat-label">Total Volume</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalSets() }}</div>
          <div class="stat-label">Total Sets</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageDuration() }} min</div>
          <div class="stat-label">Avg Duration</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading">
        <p>Loading workout history...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error">
        <p>{{ error() }}</p>
        <button (click)="loadHistory()" class="btn-primary">Retry</button>
      </div>

      <!-- Workout List -->
      <div *ngIf="!loading() && !error()" class="workouts-list">
        <div
          *ngFor="let workout of workouts()"
          class="workout-card"
          (click)="viewWorkoutDetail(workout.id)"
        >
          <div class="workout-header">
            <h3>{{ formatDate(workout.workoutDate) }}</h3>
            <span class="duration">{{ workout.durationMinutes }} min</span>
          </div>
          <div class="workout-stats-row">
            <div class="stat-item">
              <span class="label">Volume:</span>
              <span class="value">{{ workout.totalVolume }} kg</span>
            </div>
            <div class="stat-item">
              <span class="label">Sets:</span>
              <span class="value">{{ workout.totalSets }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Exercises:</span>
              <span class="value">{{ workout.totalExercises }}</span>
            </div>
          </div>
          <div class="workout-time">
            {{ formatTime(workout.startTime) }} - {{ formatTime(workout.endTime) }}
          </div>
        </div>

        <div *ngIf="workouts().length === 0" class="no-workouts">
          <p>No workouts found for this period.</p>
          <button (click)="selectQuickFilter('month')" class="btn-secondary">
            View This Month
          </button>
        </div>
      </div>

      <!-- Workout Detail Modal -->
      <div *ngIf="selectedWorkoutDetail()" class="modal-overlay" (click)="closeDetail()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Workout Details</h3>
            <button (click)="closeDetail()" class="btn-close">×</button>
          </div>

          <div class="modal-body" *ngIf="selectedWorkoutDetail() as workout">
            <div class="detail-section">
              <h4>{{ formatDate(workout.workoutDate) }}</h4>
              <p class="detail-time">
                {{ formatTime(workout.startTime) }} - {{ workout.endTime ? formatTime(workout.endTime) : 'In Progress' }}
                ({{ workout.durationMinutes }} minutes)
              </p>
              <p *ngIf="workout.notes" class="workout-notes">{{ workout.notes }}</p>
            </div>

            <div class="detail-section">
              <h4>Summary</h4>
              <div class="detail-stats">
                <div class="detail-stat">
                  <strong>Total Volume:</strong> {{ workout.totalVolume }} kg
                </div>
                <div class="detail-stat">
                  <strong>Total Sets:</strong> {{ workout.sets.length }}
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Sets</h4>
              <div class="sets-table">
                <div *ngFor="let set of workout.sets; let i = index" class="set-row">
                  <span class="set-number">{{ i + 1 }}</span>
                  <span class="set-exercise">{{ set.exerciseName }}</span>
                  <span class="set-data">{{ set.reps }} × {{ set.weightKg }} kg</span>
                  <span class="set-volume">{{ set.volumeLoad }} kg</span>
                  <span *ngIf="set.rpe" class="set-rpe">RPE {{ set.rpe }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workout-history-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h2 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin: 0;
    }

    .date-selector {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .quick-filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }

    .filter-btn:hover {
      border-color: #4CAF50;
    }

    .filter-btn.active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;
    }

    .custom-range {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .custom-range label {
      font-weight: 500;
      color: #333;
    }

    .date-input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 8px;
    }

    .stat-label {
      color: #666;
      font-size: 14px;
    }

    .workouts-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .workout-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .workout-card:hover {
      border-color: #4CAF50;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .workout-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .workout-header h3 {
      margin: 0;
      color: #333;
    }

    .duration {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .workout-stats-row {
      display: flex;
      gap: 30px;
      margin-bottom: 10px;
    }

    .stat-item {
      display: flex;
      gap: 8px;
      font-size: 14px;
    }

    .stat-item .label {
      color: #666;
    }

    .stat-item .value {
      color: #333;
      font-weight: 600;
    }

    .workout-time {
      color: #999;
      font-size: 13px;
    }

    .loading, .error, .no-workouts {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .error {
      color: #d32f2f;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 32px;
      color: #999;
      cursor: pointer;
      line-height: 1;
      padding: 0;
    }

    .btn-close:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .detail-section {
      margin-bottom: 30px;
    }

    .detail-section h4 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 18px;
    }

    .detail-time {
      color: #666;
      margin: 5px 0;
    }

    .workout-notes {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      color: #333;
      font-style: italic;
      margin-top: 10px;
    }

    .detail-stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .detail-stat {
      color: #666;
    }

    .sets-table {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .set-row {
      display: grid;
      grid-template-columns: 50px 2fr 1fr 1fr auto;
      gap: 15px;
      align-items: center;
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
    }

    .set-number {
      font-weight: 600;
      color: #666;
      text-align: center;
    }

    .set-exercise {
      font-weight: 500;
      color: #333;
    }

    .set-data {
      color: #666;
    }

    .set-volume {
      color: #4CAF50;
      font-weight: 600;
    }

    .set-rpe {
      background: #fff3e0;
      color: #f57c00;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-primary:hover {
      background: #45a049;
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      border-color: #999;
      color: #333;
    }
  `]
})
export class WorkoutHistoryComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  // State
  workouts = signal<WorkoutHistoryResponse[]>([]);
  selectedWorkoutDetail = signal<WorkoutDetailResponse | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Date range
  startDate: string = '';
  endDate: string = '';
  selectedFilter = signal<string>('week');

  // Quick filter options
  quickFilters = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'This Year', value: 'year' }
  ];

  // Computed stats
  totalWorkouts = computed(() => this.workouts().length);

  totalVolume = computed(() => {
    return Math.round(
      this.workouts().reduce((sum, w) => sum + w.totalVolume, 0)
    );
  });

  totalSets = computed(() => {
    return this.workouts().reduce((sum, w) => sum + w.totalSets, 0);
  });

  averageDuration = computed(() => {
    const workouts = this.workouts();
    if (workouts.length === 0) return 0;
    const total = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
    return Math.round(total / workouts.length);
  });

  ngOnInit(): void {
    this.selectQuickFilter('week');
  }

  selectQuickFilter(filter: string): void {
    this.selectedFilter.set(filter);
    const now = new Date();
    let start = new Date();

    switch (filter) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    this.startDate = start.toISOString().split('T')[0];
    this.endDate = now.toISOString().split('T')[0];
    this.loadHistory();
  }

  onDateChange(): void {
    this.selectedFilter.set('');
  }

  loadHistory(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.workoutService.getWorkoutHistory(this.startDate, this.endDate).subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load workout history. Please try again.');
        this.loading.set(false);
        console.error('Error loading history:', err);
      }
    });
  }

  viewWorkoutDetail(workoutId: number): void {
    this.workoutService.getWorkoutDetail(workoutId).subscribe({
      next: (detail) => {
        this.selectedWorkoutDetail.set(detail);
      },
      error: (err) => {
        this.error.set('Failed to load workout details.');
        console.error('Error loading workout detail:', err);
      }
    });
  }

  closeDetail(): void {
    this.selectedWorkoutDetail.set(null);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
