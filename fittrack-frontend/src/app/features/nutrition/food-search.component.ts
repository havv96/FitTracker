import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodCategory, FoodItem, FoodItemsPage, MealType } from '../../core/models/nutrition.model';
import { NutritionService } from '../../core/services/nutrition.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtChipComponent } from '../../shared/ui/ft-chip.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';

@Component({
  selector: 'app-food-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtChipComponent,
    FtEmptyStateComponent,
    FtFormFieldComponent,
    FtIconComponent,
    FtTagComponent,
  ],
  templateUrl: './food-search.component.html',
  styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  readonly foods = signal<FoodItem[]>([]);
  readonly selectedFood = signal<FoodItem | null>(null);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly showLogForm = signal<boolean>(false);
  readonly logging = signal<boolean>(false);

  searchTerm = '';
  readonly selectedCategory = signal<FoodCategory | null>(null);
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly totalResults = signal<number>(0);
  pageSize = 20;

  targetMealType?: MealType;
  targetDate?: string;

  readonly categories = Object.values(FoodCategory);
  readonly mealTypes = Object.values(MealType);

  readonly mealLabels: Record<MealType, string> = {
    [MealType.BREAKFAST]: $localize`:@@meal.breakfast:Breakfast`,
    [MealType.LUNCH]: $localize`:@@meal.lunch:Lunch`,
    [MealType.DINNER]: $localize`:@@meal.dinner:Dinner`,
    [MealType.SNACK]: $localize`:@@meal.snack:Snack`,
  };

  readonly hasFilters = computed(() => !!(this.searchTerm || this.selectedCategory()));

  logForm: FormGroup;

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.logForm = this.fb.group({
      mealType: [MealType.BREAKFAST, Validators.required],
      servings: [1, [Validators.required, Validators.min(0.1)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.targetMealType = params['mealType'];
      this.targetDate = params['date'];
      if (this.targetMealType) this.logForm.patchValue({ mealType: this.targetMealType });
    });
    this.searchFood();
  }

  searchFood(): void {
    this.loading.set(true);
    this.error.set(null);

    this.nutritionService
      .searchFood({
        searchTerm: this.searchTerm || undefined,
        category: this.selectedCategory() ?? undefined,
        page: this.currentPage(),
        size: this.pageSize,
      })
      .subscribe({
        next: (response: FoodItemsPage) => {
          this.foods.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalResults.set(response.totalElements);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set($localize`:@@foodSearch.errorLoad:Could not search food items.`);
          this.loading.set(false);
          console.error('Error searching food:', err);
        },
      });
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(0);
      this.searchFood();
    }, 300);
  }

  toggleCategory(cat: FoodCategory | null): void {
    this.selectedCategory.update((c) => (c === cat ? null : cat));
    this.currentPage.set(0);
    this.searchFood();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory.set(null);
    this.currentPage.set(0);
    this.searchFood();
  }

  selectFood(food: FoodItem): void {
    this.selectedFood.set(food);
    this.showLogForm.set(true);
  }

  closeLogForm(): void {
    this.showLogForm.set(false);
    this.selectedFood.set(null);
    this.logForm.reset({
      mealType: this.targetMealType || MealType.BREAKFAST,
      servings: 1,
    });
  }

  logFood(): void {
    if (this.logForm.invalid || !this.selectedFood()) return;
    this.logging.set(true);
    const food = this.selectedFood()!;

    this.nutritionService
      .logFood({
        foodItemId: food.id,
        mealType: this.logForm.value.mealType,
        servings: this.logForm.value.servings,
        logDate: this.targetDate || new Date().toISOString().split('T')[0],
      })
      .subscribe({
        next: () => {
          this.logging.set(false);
          this.toast.success($localize`:@@foodSearch.loggedToast:Food logged.`);
          this.goBack();
        },
        error: (err) => {
          this.error.set($localize`:@@foodSearch.errorLog:Could not log food.`);
          this.logging.set(false);
          console.error('Error logging food:', err);
        },
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

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.searchFood();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.searchFood();
    }
  }

  goBack(): void {
    this.router.navigate(['/nutrition']);
  }
}
