import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NutritionService } from '../../core/services/nutrition.service';
import {
  FoodItem,
  FoodCategory,
  MealType,
  FoodItemsPage
} from '../../core/models/nutrition.model';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="food-search-container">
      <!-- Header -->
      <div class="header">
        <button (click)="goBack()" class="btn-back">← Back</button>
        <h2>Search Food</h2>
      </div>

      <!-- Search Box -->
      <div class="search-section">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Search food items..."
          class="search-input"
        />

        <div class="filters">
          <select [(ngModel)]="selectedCategory" (ngModelChange)="onFilterChange()" class="filter-select">
            <option [ngValue]="null">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>

          <button (click)="clearFilters()" *ngIf="hasFilters()" class="btn-secondary">
            Clear
          </button>

          <button (click)="showCustomFoodForm()" class="btn-primary">
            + Create Custom Food
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="loading">
        <p>Searching...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="error">
        <p>{{ error() }}</p>
      </div>

      <!-- Results -->
      <div *ngIf="!loading() && !error()" class="results-section">
        <div class="results-count">
          {{ totalResults() }} food items found
        </div>

        <div class="food-grid">
          <div
            *ngFor="let food of foods()"
            class="food-card"
            (click)="selectFood(food)"
            [class.selected]="selectedFood()?.id === food.id"
          >
            <div class="food-header">
              <h3>{{ food.name }}</h3>
              <span *ngIf="food.brand" class="brand">{{ food.brand }}</span>
              <span class="badge" [class]="'category-' + food.category">{{ food.category }}</span>
            </div>
            <div class="food-details">
              <div class="serving">{{ food.servingSize }} {{ food.servingUnit }}</div>
              <div class="macros-row">
                <span class="macro calories-badge">{{ food.calories }} cal</span>
                <span class="macro">P: {{ food.proteinG }}g</span>
                <span class="macro">C: {{ food.carbsG }}g</span>
                <span class="macro">F: {{ food.fatG }}g</span>
              </div>
            </div>
          </div>

          <div *ngIf="foods().length === 0 && !loading()" class="no-results">
            <p>No food items found.</p>
            <button (click)="showCustomFoodForm()" class="btn-primary">
              Create Custom Food
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages() > 1" class="pagination">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 0"
            class="btn-secondary"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage() + 1 }} of {{ totalPages() }}
          </span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages() - 1"
            class="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Selected Food Details Modal -->
      <div *ngIf="selectedFood() && showLogForm()" class="modal-overlay" (click)="closeLogForm()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Log Food</h3>
            <button (click)="closeLogForm()" class="btn-close">×</button>
          </div>

          <div class="modal-body">
            <div class="food-info-section">
              <h4>{{ selectedFood()!.name }}</h4>
              <p *ngIf="selectedFood()!.brand" class="brand-name">{{ selectedFood()!.brand }}</p>
              <p class="serving-info">{{ selectedFood()!.servingSize }} {{ selectedFood()!.servingUnit }}</p>
            </div>

            <form [formGroup]="logForm" (ngSubmit)="logFood()">
              <div class="form-group">
                <label>Meal Type</label>
                <select formControlName="mealType" class="form-input">
                  <option *ngFor="let meal of mealTypes" [value]="meal">{{ meal }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Servings</label>
                <input
                  type="number"
                  formControlName="servings"
                  class="form-input"
                  min="0.1"
                  step="0.5"
                />
                <div *ngIf="logForm.get('servings')?.invalid && logForm.get('servings')?.touched" class="error-text">
                  Servings must be positive
                </div>
              </div>

              <div class="nutrition-preview">
                <h5>Nutrition ({{ logForm.value.servings }} servings):</h5>
                <div class="preview-grid">
                  <div class="preview-item">
                    <span class="label">Calories:</span>
                    <span class="value">{{ calculateTotalCalories() }}</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Protein:</span>
                    <span class="value">{{ calculateTotalMacro('proteinG') }}g</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Carbs:</span>
                    <span class="value">{{ calculateTotalMacro('carbsG') }}g</span>
                  </div>
                  <div class="preview-item">
                    <span class="label">Fat:</span>
                    <span class="value">{{ calculateTotalMacro('fatG') }}g</span>
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  [disabled]="logForm.invalid || logging()"
                  class="btn-primary btn-block"
                >
                  {{ logging() ? 'Logging...' : 'Log Food' }}
                </button>
                <button
                  type="button"
                  (click)="closeLogForm()"
                  class="btn-secondary btn-block"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .food-search-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .header h2 {
      margin: 0;
      color: #333;
    }

    .btn-back {
      background: white;
      border: 1px solid #ddd;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }

    .btn-back:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    .search-section {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .search-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .filters {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .filter-select {
      flex: 1;
      min-width: 150px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .results-count {
      margin-bottom: 20px;
      color: #666;
      font-size: 14px;
    }

    .food-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .food-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .food-card:hover {
      border-color: #4CAF50;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .food-card.selected {
      border-color: #4CAF50;
      background: #f1f8f4;
    }

    .food-header {
      margin-bottom: 15px;
    }

    .food-header h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    .brand {
      display: block;
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background: #e3f2fd;
      color: #1976d2;
    }

    .food-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .serving {
      color: #666;
      font-size: 14px;
    }

    .macros-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .macro {
      padding: 4px 8px;
      background: #f5f5f5;
      border-radius: 4px;
      font-size: 13px;
      color: #666;
    }

    .calories-badge {
      background: #4CAF50;
      color: white;
      font-weight: 600;
    }

    .loading, .error, .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .error {
      color: #d32f2f;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 30px;
    }

    .page-info {
      color: #666;
      font-weight: 500;
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
      max-width: 500px;
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

    .food-info-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .food-info-section h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .brand-name {
      color: #666;
      margin: 0 0 8px 0;
      font-size: 14px;
    }

    .serving-info {
      color: #666;
      margin: 0;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .error-text {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 4px;
    }

    .nutrition-preview {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .nutrition-preview h5 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .preview-item {
      display: flex;
      justify-content: space-between;
    }

    .preview-item .label {
      color: #666;
    }

    .preview-item .value {
      font-weight: 600;
      color: #333;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
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

    .btn-primary:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
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

    .btn-secondary:hover:not(:disabled) {
      border-color: #999;
      color: #333;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-block {
      width: 100%;
    }
  `]
})
export class FoodSearchComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  // State
  foods = signal<FoodItem[]>([]);
  selectedFood = signal<FoodItem | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showLogForm = signal<boolean>(false);
  logging = signal<boolean>(false);

  // Search params
  searchTerm: string = '';
  selectedCategory: FoodCategory | null = null;
  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  totalResults = signal<number>(0);
  pageSize = 20;

  // Query params from route
  targetMealType?: MealType;
  targetDate?: string;

  // Options
  categories = Object.values(FoodCategory);
  mealTypes = Object.values(MealType);

  // Form
  logForm: FormGroup;

  // Debounce timer
  private searchDebounceTimer: any;

  constructor() {
    this.logForm = this.fb.group({
      mealType: ['BREAKFAST', Validators.required],
      servings: [1, [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit(): void {
    // Get query params
    this.route.queryParams.subscribe(params => {
      this.targetMealType = params['mealType'];
      this.targetDate = params['date'];

      if (this.targetMealType) {
        this.logForm.patchValue({ mealType: this.targetMealType });
      }
    });

    this.searchFood();
  }

  searchFood(): void {
    this.loading.set(true);
    this.error.set(null);

    this.nutritionService.searchFood({
      searchTerm: this.searchTerm || undefined,
      category: this.selectedCategory || undefined,
      page: this.currentPage(),
      size: this.pageSize
    }).subscribe({
      next: (response: FoodItemsPage) => {
        this.foods.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalResults.set(response.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to search food items');
        this.loading.set(false);
        console.error('Error searching food:', err);
      }
    });
  }

  onSearchChange(term: string): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(0);
      this.searchFood();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.searchFood();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.currentPage.set(0);
    this.searchFood();
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory);
  }

  selectFood(food: FoodItem): void {
    this.selectedFood.set(food);
    this.showLogForm.set(true);
  }

  closeLogForm(): void {
    this.showLogForm.set(false);
    this.selectedFood.set(null);
    this.logForm.reset({
      mealType: this.targetMealType || 'BREAKFAST',
      servings: 1
    });
  }

  logFood(): void {
    if (this.logForm.invalid || !this.selectedFood()) {
      return;
    }

    this.logging.set(true);
    const food = this.selectedFood()!;

    this.nutritionService.logFood({
      foodItemId: food.id,
      mealType: this.logForm.value.mealType,
      servings: this.logForm.value.servings,
      logDate: this.targetDate || new Date().toISOString().split('T')[0]
    }).subscribe({
      next: () => {
        this.logging.set(false);
        alert('Food logged successfully!');
        this.goBack();
      },
      error: (err) => {
        this.error.set('Failed to log food');
        this.logging.set(false);
        console.error('Error logging food:', err);
      }
    });
  }

  calculateTotalCalories(): number {
    const food = this.selectedFood();
    if (!food) return 0;
    return Math.round(food.calories * this.logForm.value.servings);
  }

  calculateTotalMacro(macro: 'proteinG' | 'carbsG' | 'fatG'): number {
    const food = this.selectedFood();
    if (!food) return 0;
    return Math.round(food[macro] * this.logForm.value.servings * 10) / 10;
  }

  showCustomFoodForm(): void {
    // TODO: Implement custom food creation
    alert('Custom food creation coming soon!');
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.searchFood();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.searchFood();
    }
  }

  goBack(): void {
    this.router.navigate(['/nutrition']);
  }
}
