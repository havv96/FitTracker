// Metrics and Analytics Models

export interface DailyStats {
  id: number;
  userId: number;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  workoutDurationMinutes: number;
  caloriesBurned: number;
  waterIntakeMl?: number;
  sleepHours?: number;
  mood?: string;
  energyLevel?: number;
  notes?: string;
}

export interface WeeklyProgress {
  weekStartDate: string;
  workoutCount: number;
  totalVolume: number;
  avgWorkoutDuration: number;
  caloriesConsumed: number;
  avgDailyCalories: number;
  complianceRate: number;
}

export interface MonthlyProgress {
  month: string;
  year: number;
  workoutCount: number;
  totalVolume: number;
  avgProtein: number;
  avgCalories: number;
  bestWorkout: {
    date: string;
    volume: number;
  };
}

export interface ProgressChartData {
  dates: string[];
  weights: number[];
  volumes: number[];
  calories: number[];
}

export interface PersonalRecords {
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  bestReps: number;
  achievedDate: string;
}

export interface BodyMetrics {
  id: number;
  userId: number;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  legsCm?: number;
  notes?: string;
}

export interface GoalProgress {
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  startDate: string;
  targetDate: string;
  isCompleted: boolean;
}

export enum GoalType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  WEIGHT_GAIN = 'WEIGHT_GAIN',
  MUSCLE_GAIN = 'MUSCLE_GAIN',
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  CONSISTENCY = 'CONSISTENCY'
}

export interface AnalyticsSummary {
  totalWorkouts: number;
  totalVolume: number;
  avgWorkoutDuration: number;
  consistencyStreak: number;
  bestStreak: number;
  calorieCompliance: number;
  proteinCompliance: number;
  personalRecords: PersonalRecords[];
  recentProgress: WeeklyProgress[];
  bodyMetrics: BodyMetrics[];
}

// Request DTOs
export interface BodyMetricsRequest {
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  legsCm?: number;
  notes?: string;
}

export interface DateRangeRequest {
  startDate: string;
  endDate: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface MultiSeriesChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}
