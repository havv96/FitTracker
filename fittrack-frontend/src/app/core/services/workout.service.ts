import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, distinctUntilChanged, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  Exercise,
  WorkoutStartRequest,
  WorkoutSetRequest,
  WorkoutResponse,
  WorkoutSetResponse,
  WorkoutHistoryResponse,
  WorkoutDetailResponse,
  ExerciseSearchParams,
  PagedResponse
} from '../models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = `${environment.apiBaseUrl}/workouts`;
  private exercisesUrl = `${environment.apiBaseUrl}/exercises`;

  // Current active workout state
  currentWorkout = signal<WorkoutResponse | null>(null);
  currentWorkoutSets = signal<WorkoutSetResponse[]>([]);
  hydratingActive = signal<boolean>(false);

  constructor() {
    this.authService.currentUser$
      .pipe(distinctUntilChanged((a, b) => a?.id === b?.id))
      .subscribe((user) => {
        if (user) {
          this.hydratingActive.set(true);
          this.loadActiveWorkout()
            .pipe(catchError(() => of(null)))
            .subscribe(() => this.hydratingActive.set(false));
        } else {
          this.clearCurrentWorkout();
        }
      });
  }

  // Exercise Methods
  getAllExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.exercisesUrl);
  }

  searchExercises(params: ExerciseSearchParams): Observable<PagedResponse<Exercise>> {
    let httpParams = new HttpParams();

    if (params.muscleGroup) {
      httpParams = httpParams.set('muscleGroup', params.muscleGroup);
    }
    if (params.equipmentType) {
      httpParams = httpParams.set('equipmentType', params.equipmentType);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }

    return this.http.get<PagedResponse<Exercise>>(`${this.exercisesUrl}/search`, { params: httpParams });
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.exercisesUrl}/${id}`);
  }

  // Workout Methods
  startWorkout(request: WorkoutStartRequest): Observable<WorkoutResponse> {
    return this.http.post<WorkoutResponse>(this.baseUrl, request).pipe(
      tap(workout => {
        this.currentWorkout.set(workout);
        this.currentWorkoutSets.set([]);
      })
    );
  }

  logSet(workoutId: number, request: WorkoutSetRequest): Observable<WorkoutSetResponse> {
    return this.http.post<WorkoutSetResponse>(`${this.baseUrl}/${workoutId}/sets`, request).pipe(
      tap(set => {
        // Add the new set to current workout sets
        this.currentWorkoutSets.update(sets => [...sets, set]);
      })
    );
  }

  finishWorkout(workoutId: number): Observable<WorkoutResponse> {
    return this.http.put<WorkoutResponse>(`${this.baseUrl}/${workoutId}/finish`, {}).pipe(
      tap(workout => {
        this.currentWorkout.set(null);
        this.currentWorkoutSets.set([]);
      })
    );
  }

  getWorkoutHistory(startDate: string, endDate: string): Observable<WorkoutHistoryResponse[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<WorkoutHistoryResponse[]>(`${this.baseUrl}/history`, { params });
  }

  getWorkoutDetail(workoutId: number): Observable<WorkoutDetailResponse> {
    return this.http.get<WorkoutDetailResponse>(`${this.baseUrl}/${workoutId}`);
  }

  loadActiveWorkout(): Observable<WorkoutDetailResponse | null> {
    return this.http.get<WorkoutDetailResponse | null>(`${this.baseUrl}/active`).pipe(
      tap((detail) => {
        if (detail) {
          this.currentWorkout.set(this.toSummary(detail));
          this.currentWorkoutSets.set(detail.sets ?? []);
        } else {
          this.currentWorkout.set(null);
          this.currentWorkoutSets.set([]);
        }
      }),
    );
  }

  private toSummary(detail: WorkoutDetailResponse): WorkoutResponse {
    return {
      id: detail.id,
      userId: detail.userId,
      workoutDate: detail.workoutDate,
      startTime: detail.startTime,
      endTime: detail.endTime,
      notes: detail.notes,
      totalVolume: detail.totalVolume,
      totalSets: detail.sets?.length ?? 0,
      durationMinutes: detail.durationMinutes,
    };
  }

  getPreviousWorkoutData(workoutId: number, exerciseId: number): Observable<WorkoutSetResponse[]> {
    return this.http.get<WorkoutSetResponse[]>(
      `${this.baseUrl}/${workoutId}/exercises/${exerciseId}/previous`
    );
  }

  // Helper Methods
  clearCurrentWorkout(): void {
    this.currentWorkout.set(null);
    this.currentWorkoutSets.set([]);
  }

  hasActiveWorkout(): boolean {
    return this.currentWorkout() !== null;
  }

  getCurrentWorkoutTotalVolume(): number {
    return this.currentWorkoutSets().reduce((total, set) => total + set.volumeLoad, 0);
  }

  getCurrentWorkoutTotalSets(): number {
    return this.currentWorkoutSets().length;
  }

  getUniqueExercisesCount(): number {
    const uniqueExerciseIds = new Set(this.currentWorkoutSets().map(set => set.exerciseId));
    return uniqueExerciseIds.size;
  }
}
