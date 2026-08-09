import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutDetailResponse, WorkoutHistoryResponse } from '../../core/models/workout.model';
import { WorkoutService } from '../../core/services/workout.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtChipComponent } from '../../shared/ui/ft-chip.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';

type QuickFilter = 'week' | 'month' | '3months' | 'year' | '';

@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtChipComponent,
    FtEmptyStateComponent,
    FtFormFieldComponent,
    FtIconComponent,
    FtStatCardComponent,
    FtTagComponent,
  ],
  templateUrl: './workout-history.component.html',
  styleUrls: ['./workout-history.component.scss'],
})
export class WorkoutHistoryComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  workouts = signal<WorkoutHistoryResponse[]>([]);
  selectedWorkoutDetail = signal<WorkoutDetailResponse | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  startDate = '';
  endDate = '';
  selectedFilter = signal<QuickFilter>('week');

  readonly quickFilters: { label: string; value: Exclude<QuickFilter, ''> }[] = [
    { label: $localize`:@@history.filter.week:This week`, value: 'week' },
    { label: $localize`:@@history.filter.month:This month`, value: 'month' },
    { label: $localize`:@@history.filter.3months:Last 3 months`, value: '3months' },
    { label: $localize`:@@history.filter.year:This year`, value: 'year' },
  ];

  readonly totalWorkouts = computed(() => this.workouts().length);
  readonly totalVolume = computed(() =>
    Math.round(this.workouts().reduce((sum, w) => sum + (w.totalVolume ?? 0), 0)),
  );
  readonly totalSets = computed(() => this.workouts().reduce((sum, w) => sum + (w.totalSets ?? 0), 0));
  readonly averageDuration = computed(() => {
    const list = this.workouts();
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, w) => sum + (w.durationMinutes ?? 0), 0) / list.length);
  });

  ngOnInit(): void {
    this.selectQuickFilter('week');
  }

  selectQuickFilter(filter: Exclude<QuickFilter, ''>): void {
    this.selectedFilter.set(filter);
    const now = new Date();
    const start = new Date();

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
    this.loadHistory();
  }

  loadHistory(): void {
    if (!this.startDate || !this.endDate) return;
    this.loading.set(true);
    this.error.set(null);

    this.workoutService.getWorkoutHistory(this.startDate, this.endDate).subscribe({
      next: (workouts) => {
        this.workouts.set(workouts);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set($localize`:@@history.errorLoad:Could not load workout history.`);
        this.loading.set(false);
        console.error('Error loading history:', err);
      },
    });
  }

  viewWorkoutDetail(workoutId: number): void {
    this.workoutService.getWorkoutDetail(workoutId).subscribe({
      next: (detail) => this.selectedWorkoutDetail.set(detail),
      error: (err) => {
        this.error.set($localize`:@@history.errorDetail:Could not load workout details.`);
        console.error('Error loading workout detail:', err);
      },
    });
  }

  closeDetail(): void {
    this.selectedWorkoutDetail.set(null);
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(timeString: string | undefined | null): string {
    if (!timeString) return '—';
    const date = new Date(timeString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
}
