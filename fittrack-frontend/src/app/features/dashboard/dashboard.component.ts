import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { NutritionService } from '../../core/services/nutrition.service';
import { WorkoutService } from '../../core/services/workout.service';
import { DailyNutritionSummary } from '../../core/models/nutrition.model';
import { WorkoutHistoryResponse } from '../../core/models/workout.model';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtProgressBarComponent } from '../../shared/ui/ft-progress-bar.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';
import { FtActivityRingsComponent, Ring } from '../../shared/viz/ft-activity-rings.component';

const DAY_MS = 86_400_000;

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString().split('T')[0];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FtButtonComponent,
    FtCardComponent,
    FtEmptyStateComponent,
    FtProgressBarComponent,
    FtStatCardComponent,
    FtTagComponent,
    FtActivityRingsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);

  readonly summary = signal<DailyNutritionSummary | null>(null);
  readonly workouts = signal<WorkoutHistoryResponse[]>([]);

  readonly hasActiveWorkout = computed(() => this.workoutService.hasActiveWorkout());
  readonly currentUserEmail = signal<string | null>(null);

  readonly caloriesLine = computed(() => {
    const s = this.summary();
    if (!s) return { consumed: 0, target: 0 };
    return { consumed: Math.round(s.consumedCalories), target: Math.round(s.targetCalories) };
  });

  readonly proteinLine = computed(() => {
    const s = this.summary();
    if (!s) return { consumed: 0, target: 0 };
    return { consumed: Math.round(s.consumedProtein), target: Math.round(s.targetProtein) };
  });

  readonly weeklyWorkoutCount = computed(() => this.workouts().length);

  readonly totalWeeklyVolume = computed(() =>
    Math.round(this.workouts().reduce((sum, w) => sum + (w.totalVolume ?? 0), 0)),
  );

  readonly volumeDisplay = computed(() => this.totalWeeklyVolume().toLocaleString());

  readonly caloriesPct = computed(() => {
    const { consumed, target } = this.caloriesLine();
    if (!target) return 0;
    return Math.min(100, Math.round((consumed / target) * 100));
  });

  readonly proteinPct = computed(() => {
    const { consumed, target } = this.proteinLine();
    if (!target) return 0;
    return Math.min(100, Math.round((consumed / target) * 100));
  });

  readonly carbsPct = computed(() => {
    const s = this.summary();
    if (!s || !s.targetCarbs) return 0;
    return Math.min(100, Math.round((s.consumedCarbs / s.targetCarbs) * 100));
  });

  readonly fatPct = computed(() => {
    const s = this.summary();
    if (!s || !s.targetFat) return 0;
    return Math.min(100, Math.round((s.consumedFat / s.targetFat) * 100));
  });

  readonly rings = computed<Ring[]>(() => [
    { value: this.caloriesLine().consumed, max: this.caloriesLine().target || 1, tone: 'accent' },
    { value: this.proteinLine().consumed, max: this.proteinLine().target || 1, tone: 'success' },
    { value: this.weeklyWorkoutCount(), max: 5, tone: 'warn' },
  ]);

  readonly recentWorkouts = computed(() => this.workouts().slice(0, 5));

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => this.currentUserEmail.set(u?.email ?? null));

    this.nutritionService
      .getDailySummary(todayIso())
      .pipe(catchError(() => of(null)))
      .subscribe((s) => this.summary.set(s));

    this.workoutService
      .getWorkoutHistory(daysAgo(7), todayIso())
      .pipe(catchError(() => of([] as WorkoutHistoryResponse[])))
      .subscribe((list) => this.workouts.set(list ?? []));
  }

  formatDate(d: string | undefined | null): string {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
