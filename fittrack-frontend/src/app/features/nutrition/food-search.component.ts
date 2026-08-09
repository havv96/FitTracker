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
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss']
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
