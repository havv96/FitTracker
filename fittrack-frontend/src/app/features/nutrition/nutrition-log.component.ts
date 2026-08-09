import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DailyNutritionSummary, MealType, NutritionLog } from '../../core/models/nutrition.model';
import { NutritionService } from '../../core/services/nutrition.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtProgressBarComponent } from '../../shared/ui/ft-progress-bar.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';

@Component({
  selector: 'app-nutrition-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtEmptyStateComponent,
    FtIconComponent,
    FtProgressBarComponent,
    FtStatCardComponent,
  ],
  templateUrl: './nutrition-log.component.html',
  styleUrls: ['./nutrition-log.component.scss'],
})
export class NutritionLogComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private router = inject(Router);
  private confirmDialog = inject(ConfirmDialogService);

  readonly summary = signal<DailyNutritionSummary | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  selectedDate = '';

  readonly mealTypes = Object.values(MealType);
  readonly mealLabels: Record<MealType, string> = {
    [MealType.BREAKFAST]: $localize`:@@meal.breakfast:Breakfast`,
    [MealType.LUNCH]: $localize`:@@meal.lunch:Lunch`,
    [MealType.DINNER]: $localize`:@@meal.dinner:Dinner`,
    [MealType.SNACK]: $localize`:@@meal.snack:Snack`,
  };

  readonly calorieProgress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.min(Math.round((s.consumedCalories / (s.targetCalories || 1)) * 100), 100);
  });

  readonly remainingCalories = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.max(0, Math.round(s.remainingCalories ?? s.targetCalories - s.consumedCalories));
  });

  readonly proteinProgress = computed(() =>
    this.pct(this.summary()?.consumedProtein, this.summary()?.targetProtein),
  );
  readonly carbsProgress = computed(() =>
    this.pct(this.summary()?.consumedCarbs, this.summary()?.targetCarbs),
  );
  readonly fatProgress = computed(() =>
    this.pct(this.summary()?.consumedFat, this.summary()?.targetFat),
  );

  readonly ringDashArray = 2 * Math.PI * 16;
  readonly ringDashOffset = computed(() => {
    const pct = this.calorieProgress() / 100;
    return this.ringDashArray * (1 - pct);
  });

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadDailySummary();
  }

  loadDailySummary(): void {
    this.loading.set(true);
    this.error.set(null);

    this.nutritionService.getDailySummary(this.selectedDate).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set($localize`:@@nutrition.errorLoad:Could not load nutrition data.`);
        this.loading.set(false);
        console.error('Error loading nutrition summary:', err);
      },
    });
  }

  onDateChange(): void {
    this.loadDailySummary();
  }

  previousDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() - 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadDailySummary();
  }

  nextDay(): void {
    const date = new Date(this.selectedDate);
    date.setDate(date.getDate() + 1);
    this.selectedDate = date.toISOString().split('T')[0];
    this.loadDailySummary();
  }

  isToday(): boolean {
    return this.selectedDate === new Date().toISOString().split('T')[0];
  }

  getMealLogs(mealType: MealType): NutritionLog[] {
    const s = this.summary();
    if (!s || !s.logs) return [];
    return s.logs.filter((log) => log.mealType === mealType);
  }

  getMealTotal(mealType: MealType): number {
    return this.getMealLogs(mealType).reduce((sum, log) => sum + log.totalCalories, 0);
  }

  openAddFood(mealType: MealType): void {
    this.router.navigate(['/nutrition/search'], {
      queryParams: { mealType, date: this.selectedDate },
    });
  }

  async deleteLog(logId: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: $localize`:@@nutrition.deleteTitle:Delete entry?`,
      message: $localize`:@@nutrition.deleteMessage:This will remove the food from today's log.`,
      confirmText: $localize`:@@common.delete:Delete`,
      danger: true,
    });
    if (!confirmed) return;

    this.nutritionService.deleteNutritionLog(logId).subscribe({
      next: () => this.loadDailySummary(),
      error: (err) => {
        this.error.set($localize`:@@nutrition.errorDelete:Could not delete entry.`);
        console.error('Error deleting log:', err);
      },
    });
  }

  private pct(value: number | undefined | null, target: number | undefined | null): number {
    if (!value || !target) return 0;
    return Math.min(Math.round((value / target) * 100), 100);
  }
}
