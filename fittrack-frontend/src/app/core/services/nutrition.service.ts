import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { signal } from '@angular/core';
import {
  FoodItem,
  FoodItemsPage,
  NutritionLog,
  NutritionLogRequest,
  DailyNutritionSummary,
  SearchFoodParams
} from '../models/nutrition.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/nutrition`;

  private currentDaySummary = signal<DailyNutritionSummary | null>(null);

  get todaySummary() {
    return this.currentDaySummary.asReadonly();
  }

  searchFood(params: SearchFoodParams): Observable<FoodItemsPage> {
    let httpParams = new HttpParams();

    if (params.searchTerm) {
      httpParams = httpParams.set('q', params.searchTerm);
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

  logFood(request: NutritionLogRequest): Observable<NutritionLog> {
    return this.http.post<NutritionLog>(`${this.API_URL}/logs`, request).pipe(
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
