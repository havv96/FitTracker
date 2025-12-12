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
  template: `
    <div class="nutrition-log-container">
      <!-- Header -->
      <div class="header">
        <h2>Nutrition Tracking</h2>
        <div class="date-selector">
          <button (click)="previousDay()" class="btn-icon">&larr;</button>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (ngModelChange)="onDateChange()"
            class="date-input"
          />
          <button (click)="nextDay()" [disabled]="isToday()" class="btn-icon">&rarr;</button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading">
        <p>Loading nutrition data...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error-banner">
        {{ error() }}
        <button (click)="error.set(null)" class="btn-close">×</button>
      </div>

      <!-- Daily Summary -->
      <div *ngIf="summary() && !loading()" class="daily-summary">
        <!-- Calories Progress -->
        <div class="calories-card">
          <div class="calories-header">
            <h3>Calories</h3>
            <div class="calories-remaining" [class.over]="remainingCalories() < 0">
              {{ Math.abs(remainingCalories()) }} {{ remainingCalories() >= 0 ? 'remaining' : 'over' }}
            </div>
          </div>
          <div class="calories-circle">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path class="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path class="circle"
                [attr.stroke-dasharray]="calorieProgress() + ', 100'"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" class="percentage">{{ calorieProgress() }}%</text>
            </svg>
          </div>
          <div class="calories-values">
            <span class="consumed">{{ summary()!.consumedCalories }}</span>
            <span class="separator">/</span>
            <span class="target">{{ summary()!.targetCalories }}</span>
          </div>
        </div>

        <!-- Macros Progress -->
        <div class="macros-section">
          <h3>Macronutrients</h3>
          <div class="macros-grid">
            <div class="macro-card protein">
              <div class="macro-header">
                <span class="macro-name">Protein</span>
                <span class="macro-value">{{ summary()!.consumedProtein }}g / {{ summary()!.targetProtein }}g</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="proteinProgress()"></div>
              </div>
              <div class="macro-percent">{{ proteinProgress() }}%</div>
            </div>

            <div class="macro-card carbs">
              <div class="macro-header">
                <span class="macro-name">Carbs</span>
                <span class="macro-value">{{ summary()!.consumedCarbs }}g / {{ summary()!.targetCarbs }}g</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="carbsProgress()"></div>
              </div>
              <div class="macro-percent">{{ carbsProgress() }}%</div>
            </div>

            <div class="macro-card fat">
              <div class="macro-header">
                <span class="macro-name">Fat</span>
                <span class="macro-value">{{ summary()!.consumedFat }}g / {{ summary()!.targetFat }}g</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="fatProgress()"></div>
              </div>
              <div class="macro-percent">{{ fatProgress() }}%</div>
            </div>
          </div>
        </div>

        <!-- Meals -->
        <div class="meals-section">
          <div *ngFor="let mealType of mealTypes" class="meal-group">
            <div class="meal-header">
              <h4>{{ mealType }}</h4>
              <button (click)="openAddFood(mealType)" class="btn-add">+ Add Food</button>
            </div>

            <div class="meal-entries">
              <div
                *ngFor="let log of getMealLogs(mealType)"
                class="food-entry"
              >
                <div class="food-info">
                  <span class="food-name">{{ log.foodName }}</span>
                  <span class="food-serving">{{ log.servings }} serving(s)</span>
                </div>
                <div class="food-macros">
                  <span class="calories">{{ log.totalCalories }} cal</span>
                  <span class="macro">P: {{ log.totalProteinG }}g</span>
                  <span class="macro">C: {{ log.totalCarbsG }}g</span>
                  <span class="macro">F: {{ log.totalFatG }}g</span>
                </div>
                <div class="food-actions">
                  <button (click)="editLog(log)" class="btn-icon-small">✏️</button>
                  <button (click)="deleteLog(log.id)" class="btn-icon-small">🗑️</button>
                </div>
              </div>

              <div *ngIf="getMealLogs(mealType).length === 0" class="no-entries">
                No food logged for {{ mealType.toLowerCase() }}
              </div>

              <!-- Meal Total -->
              <div *ngIf="getMealLogs(mealType).length > 0" class="meal-total">
                <span class="total-label">{{ mealType }} Total:</span>
                <span class="total-calories">{{ getMealTotal(mealType) }} cal</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Add Button -->
        <button (click)="openFoodSearch()" class="btn-primary btn-large btn-fixed">
          🔍 Search & Log Food
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nutrition-log-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 100px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .date-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .date-input {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn-icon {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
    }

    .btn-icon:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #999;
    }

    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 40px;
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

    .daily-summary {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .calories-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
    }

    .calories-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .calories-header h3 {
      margin: 0;
      color: #333;
    }

    .calories-remaining {
      color: #4CAF50;
      font-weight: 600;
      font-size: 14px;
    }

    .calories-remaining.over {
      color: #f44336;
    }

    .calories-circle {
      max-width: 200px;
      margin: 0 auto 20px;
    }

    .circular-chart {
      display: block;
      max-width: 100%;
    }

    .circle-bg {
      fill: none;
      stroke: #e0e0e0;
      stroke-width: 2.8;
    }

    .circle {
      fill: none;
      stroke-width: 2.8;
      stroke-linecap: round;
      stroke: #4CAF50;
    }

    .percentage {
      fill: #333;
      font-size: 0.5em;
      font-weight: bold;
      text-anchor: middle;
    }

    .calories-values {
      font-size: 24px;
      color: #333;
    }

    .consumed {
      font-weight: bold;
      color: #4CAF50;
    }

    .separator {
      margin: 0 10px;
      color: #999;
    }

    .target {
      color: #666;
    }

    .macros-section {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 30px;
    }

    .macros-section h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .macros-grid {
      display: grid;
      gap: 20px;
    }

    .macro-card {
      padding: 20px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .macro-card.protein {
      border-left: 4px solid #FF5722;
    }

    .macro-card.carbs {
      border-left: 4px solid #2196F3;
    }

    .macro-card.fat {
      border-left: 4px solid #FFC107;
    }

    .macro-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .macro-name {
      font-weight: 600;
      color: #333;
    }

    .macro-value {
      color: #666;
      font-size: 14px;
    }

    .progress-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
      transition: width 0.3s;
    }

    .macro-percent {
      text-align: right;
      font-size: 14px;
      color: #666;
      font-weight: 600;
    }

    .meals-section {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .meal-group {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 20px;
    }

    .meal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .meal-header h4 {
      margin: 0;
      color: #333;
    }

    .btn-add {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-add:hover {
      background: #45a049;
    }

    .meal-entries {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .food-entry {
      display: grid;
      grid-template-columns: 2fr 3fr auto;
      gap: 15px;
      align-items: center;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .food-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .food-name {
      font-weight: 600;
      color: #333;
    }

    .food-serving {
      font-size: 12px;
      color: #666;
    }

    .food-macros {
      display: flex;
      gap: 15px;
      font-size: 14px;
    }

    .calories {
      font-weight: 600;
      color: #4CAF50;
    }

    .macro {
      color: #666;
    }

    .food-actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon-small {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px;
      opacity: 0.7;
      transition: opacity 0.3s;
    }

    .btn-icon-small:hover {
      opacity: 1;
    }

    .no-entries {
      text-align: center;
      padding: 30px;
      color: #999;
      font-style: italic;
    }

    .meal-total {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
      margin-top: 10px;
    }

    .total-label {
      font-weight: 600;
      color: #1976d2;
    }

    .total-calories {
      font-weight: bold;
      color: #1976d2;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 18px;
    }

    .btn-fixed {
      position: fixed;
      bottom: 20px;
      right: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 100;
    }

    @media (max-width: 768px) {
      .food-entry {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .food-macros {
        flex-wrap: wrap;
      }

      .btn-fixed {
        left: 20px;
        right: 20px;
        width: calc(100% - 40px);
      }
    }
  `]
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
