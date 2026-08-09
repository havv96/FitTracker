import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NutritionService } from '../../core/services/nutrition.service';
import {
  DailyNutritionSummary,
  MealType,
  NutritionLog
} from '../../core/models/nutrition.model';

@Component({
  selector: 'app-nutrition-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nutrition-log.component.html',
  styleUrls: ['./nutrition-log.component.scss']
})
export class NutritionLogComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private router = inject(Router);

  Math = Math;

  // State
  summary = signal<DailyNutritionSummary | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedDate: string = '';

  mealTypes = Object.values(MealType);

  // Computed
  calorieProgress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.min(Math.round((s.consumedCalories / s.targetCalories) * 100), 100);
  });

  remainingCalories = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.round(s.remainingCalories);
  });

  proteinProgress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.min(Math.round((s.consumedProtein / s.targetProtein) * 100), 100);
  });

  carbsProgress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.min(Math.round((s.consumedCarbs / s.targetCarbs) * 100), 100);
  });

  fatProgress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    return Math.min(Math.round((s.consumedFat / s.targetFat) * 100), 100);
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
        this.error.set('Failed to load nutrition data');
        this.loading.set(false);
        console.error('Error loading nutrition summary:', err);
      }
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
    const today = new Date().toISOString().split('T')[0];
    return this.selectedDate === today;
  }

  getMealLogs(mealType: MealType): NutritionLog[] {
    const s = this.summary();
    if (!s || !s.logs) return [];
    return s.logs.filter(log => log.mealType === mealType);
  }

  getMealTotal(mealType: MealType): number {
    return this.getMealLogs(mealType).reduce((sum, log) => sum + log.totalCalories, 0);
  }

  openAddFood(mealType: MealType): void {
    // Navigate to food search with meal type
    this.router.navigate(['/nutrition/search'], {
      queryParams: { mealType, date: this.selectedDate }
    });
  }

  openFoodSearch(): void {
    this.router.navigate(['/nutrition/search'], {
      queryParams: { date: this.selectedDate }
    });
  }

  editLog(log: NutritionLog): void {
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
  }

  deleteLog(logId: number): void {
    if (!confirm('Are you sure you want to delete this food entry?')) {
      return;
    }

    this.nutritionService.deleteNutritionLog(logId).subscribe({
      next: () => {
        this.loadDailySummary();
      },
      error: (err) => {
        this.error.set('Failed to delete entry');
        console.error('Error deleting log:', err);
      }
    });
  }
}
