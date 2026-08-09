// Nutrition Domain Models

export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  barcode?: string;
  isVerified?: boolean;
  createdAt: string;
}

export interface NutritionLog {
  id: number;
  foodItemId: number;
  foodName: string;
  brand?: string;
  mealType: MealType;
  servings: number;
  logDate: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  notes?: string;
  loggedAt: string;
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
  SNACK = 'SNACK'
}

export interface DailyNutritionSummary {
  date: string;
  consumedCalories: number;
  consumedProtein: number;
  consumedCarbs: number;
  consumedFat: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
  logs: NutritionLog[];
}

// Request DTOs
export interface NutritionLogRequest {
  foodItemId: number;
  mealType: MealType;
  servings: number;
  logDate: string;
  notes?: string;
}

export interface SearchFoodParams {
  searchTerm?: string;
  page?: number;
  size?: number;
}

// Response DTOs
export interface FoodItemsPage {
  content: FoodItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
