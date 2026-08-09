import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutHistoryResponse, WorkoutDetailResponse } from '../../core/models/workout.model';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-history.component.html',
  styleUrls: ['./workout-history.component.scss']
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
