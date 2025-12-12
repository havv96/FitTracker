import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  FoodItem,
  FoodItemRequest,
  FoodItemsPage,
  NutritionLog,
  NutritionLogRequest,
  DailyNutritionSummary,
  NutritionStats,
  SearchFoodParams
} from '../models/nutrition.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/nutrition`;

  // State management
  private currentDaySummary = signal<DailyNutritionSummary | null>(null);
  private nutritionStats = signal<NutritionStats | null>(null);

  // Public getters
  get todaySummary() {
    return this.currentDaySummary.asReadonly();
  }

  get stats() {
    return this.nutritionStats.asReadonly();
  }

  // Food Database Operations
  searchFood(params: SearchFoodParams): Observable<FoodItemsPage> {
    let httpParams = new HttpParams();

    if (params.searchTerm) {
      httpParams = httpParams.set('search', params.searchTerm);
    }
    if (params.category) {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<FoodItemsPage>(`${this.API_URL}/foods/search`, { params: httpParams });
  }

  getFoodItem(id: number): Observable<FoodItem> {
    return this.http.get<FoodItem>(`${this.API_URL}/foods/${id}`);
  }

  createCustomFood(request: FoodItemRequest): Observable<FoodItem> {
    return this.http.post<FoodItem>(`${this.API_URL}/foods/custom`, request);
  }

  updateCustomFood(id: number, request: FoodItemRequest): Observable<FoodItem> {
    return this.http.put<FoodItem>(`${this.API_URL}/foods/custom/${id}`, request);
  }

  deleteCustomFood(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/foods/custom/${id}`);
  }

  getMyCustomFoods(): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`${this.API_URL}/foods/my-custom`);
  }

  // Nutrition Logging Operations
  logFood(request: NutritionLogRequest): Observable<NutritionLog> {
    return this.http.post<NutritionLog>(`${this.API_URL}/logs`, request).pipe(
      tap(() => {
        // Refresh today's summary after logging
        const today = new Date().toISOString().split('T')[0];
        this.getDailySummary(today).subscribe();
      })
    );
  }

  updateNutritionLog(id: number, request: NutritionLogRequest): Observable<NutritionLog> {
    return this.http.put<NutritionLog>(`${this.API_URL}/logs/${id}`, request).pipe(
      tap(() => {
        const today = new Date().toISOString().split('T')[0];
        this.getDailySummary(today).subscribe();
      })
    );
  }

  deleteNutritionLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/logs/${id}`).pipe(
      tap(() => {
        const today = new Date().toISOString().split('T')[0];
        this.getDailySummary(today).subscribe();
      })
    );
  }

  getDailySummary(date: string): Observable<DailyNutritionSummary> {
    const params = new HttpParams().set('date', date);
    return this.http.get<DailyNutritionSummary>(`${this.API_URL}/summary`, { params }).pipe(
      tap(summary => this.currentDaySummary.set(summary))
    );
  }

  getNutritionHistory(startDate: string, endDate: string): Observable<DailyNutritionSummary[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DailyNutritionSummary[]>(`${this.API_URL}/history`, { params });
  }

  getNutritionStats(): Observable<NutritionStats> {
    return this.http.get<NutritionStats>(`${this.API_URL}/stats`).pipe(
      tap(stats => this.nutritionStats.set(stats))
    );
  }

  // Quick Actions
  quickLogFood(foodItemId: number, mealType: string, servings: number = 1): Observable<NutritionLog> {
    const today = new Date().toISOString().split('T')[0];
    return this.logFood({
      foodItemId,
      mealType: mealType as any,
      servings,
      logDate: today
    });
  }

  // Helper Methods
  calculateMacroPercentages(summary: DailyNutritionSummary): { protein: number; carbs: number; fat: number } {
    const totalCalories = summary.consumedCalories || 1;
    return {
      protein: Math.round((summary.consumedProtein * 4 / totalCalories) * 100),
      carbs: Math.round((summary.consumedCarbs * 4 / totalCalories) * 100),
      fat: Math.round((summary.consumedFat * 9 / totalCalories) * 100)
    };
  }

  getCalorieProgress(summary: DailyNutritionSummary): number {
    return Math.round((summary.consumedCalories / summary.targetCalories) * 100);
  }

  getRemainingCalories(summary: DailyNutritionSummary): number {
    return Math.max(0, summary.targetCalories - summary.consumedCalories);
  }

  getMacroProgress(current: number, target: number): number {
    return Math.round((current / target) * 100);
  }
}
