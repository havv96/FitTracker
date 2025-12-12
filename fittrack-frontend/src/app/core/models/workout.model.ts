export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string;
  equipmentType: string;
  description?: string;
  createdAt: string;
}

export interface WorkoutStartRequest {
  date: string; // ISO date format: YYYY-MM-DD
  notes?: string;
}

export interface WorkoutSetRequest {
  exerciseId: number;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  notes?: string;
}

export interface WorkoutResponse {
  id: number;
  userId: number;
  workoutDate: string;
  startTime: string;
  endTime: string | null;
  notes?: string;
  totalVolume: number;
  totalSets: number;
  durationMinutes: number | null;
}

export interface WorkoutSetResponse {
  id: number;
  workoutId: number;
  exerciseId: number;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  notes?: string;
  volumeLoad: number;
  completedAt: string;
}

export interface WorkoutHistoryResponse {
  id: number;
  workoutDate: string;
  startTime: string;
  endTime: string;
  totalVolume: number;
  totalSets: number;
  totalExercises: number;
  durationMinutes: number;
}

export interface WorkoutDetailResponse {
  id: number;
  userId: number;
  workoutDate: string;
  startTime: string;
  endTime: string | null;
  notes?: string;
  totalVolume: number;
  durationMinutes: number | null;
  sets: WorkoutSetResponse[];
}

export interface ExerciseSearchParams {
  muscleGroup?: string;
  equipmentType?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export enum MuscleGroup {
  CHEST = 'CHEST',
  BACK = 'BACK',
  LEGS = 'LEGS',
  SHOULDERS = 'SHOULDERS',
  ARMS = 'ARMS',
  CORE = 'CORE',
  CARDIO = 'CARDIO'
}

export enum EquipmentType {
  BARBELL = 'BARBELL',
  DUMBBELL = 'DUMBBELL',
  MACHINE = 'MACHINE',
  CABLE = 'CABLE',
  BODYWEIGHT = 'BODYWEIGHT',
  CARDIO = 'CARDIO'
}
