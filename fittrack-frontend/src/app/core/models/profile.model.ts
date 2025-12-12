export interface ProfileRequest {
  heightCm: number;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  activityLevel: 'SEDENTARY' | 'LIGHTLY_ACTIVE' | 'MODERATELY_ACTIVE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE';
  weightGoal: 'LOSE_SLOW' | 'LOSE_MODERATE' | 'LOSE_FAST' | 'MAINTAIN' | 'GAIN_SLOW' | 'GAIN_MODERATE';
  targetWeightKg: number;
  currentWeightKg: number;
}

export interface ProfileResponse {
  id: number;
  userId: number;
  heightCm: number;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  activityLevel: string;
  weightGoal: string;
  targetWeightKg: number;
  createdAt: string;
  updatedAt: string;
  calculations: MetricsCalculation;
}

export interface MetricsCalculation {
  bmr: number;
  tdee: number;
  recommendedCalories: number;
  macroTargets: MacroTargets;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}
