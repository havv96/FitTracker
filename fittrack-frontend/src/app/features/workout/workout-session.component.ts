import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import {
  Exercise,
  WorkoutSetRequest,
  WorkoutSetResponse,
  WorkoutResponse
} from '../../core/models/workout.model';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="workout-session-container">
      <!-- Header -->
      <div class="header">
        <h2>{{ workoutTitle() }}</h2>
        <div class="workout-stats" *ngIf="currentWorkout()">
          <span class="stat">
            <strong>Volume:</strong> {{ totalVolume() }} kg
          </span>
          <span class="stat">
            <strong>Sets:</strong> {{ totalSets() }}
          </span>
          <span class="stat">
            <strong>Exercises:</strong> {{ uniqueExercises() }}
          </span>
          <span class="stat">
            <strong>Duration:</strong> {{ workoutDuration() }}
          </span>
        </div>
      </div>

      <!-- Start Workout (if no active workout) -->
      <div *ngIf="!currentWorkout()" class="start-workout">
        <p>No active workout session.</p>
        <button (click)="startWorkout()" class="btn-primary btn-large">
          Start New Workout
        </button>
      </div>

      <!-- Active Workout Session -->
      <div *ngIf="currentWorkout()" class="active-session">
        <!-- Exercise Selection -->
        <div class="exercise-selector">
          <h3>Select Exercise</h3>
          <select [(ngModel)]="selectedExerciseId" (ngModelChange)="onExerciseChange()" class="select-large">
            <option [ngValue]="null">Choose an exercise...</option>
            <option *ngFor="let exercise of exercises()" [ngValue]="exercise.id">
              {{ exercise.name }} ({{ exercise.muscleGroup }})
            </option>
          </select>
          <button (click)="browseExercises()" class="btn-secondary">
            Browse All Exercises
          </button>
        </div>

        <!-- Previous Workout Data -->
        <div *ngIf="selectedExercise() && previousSets().length > 0" class="previous-data">
          <h4>Last Time:</h4>
          <div class="previous-sets">
            <div *ngFor="let set of previousSets()" class="previous-set">
              Set {{ set.setNumber }}: {{ set.reps }} reps × {{ set.weightKg }} kg
              <span *ngIf="set.rpe" class="rpe">RPE {{ set.rpe }}</span>
            </div>
          </div>
        </div>

        <!-- Set Entry Form -->
        <div *ngIf="selectedExercise()" class="set-form">
          <h3>Log Set</h3>
          <form [formGroup]="setForm" (ngSubmit)="logSet()">
            <div class="form-row">
              <div class="form-group">
                <label>Reps</label>
                <input
                  type="number"
                  formControlName="reps"
                  class="form-input"
                  min="1"
                  max="1000"
                />
                <div *ngIf="setForm.get('reps')?.invalid && setForm.get('reps')?.touched" class="error-text">
                  Reps must be between 1 and 1000
                </div>
              </div>

              <div class="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  formControlName="weight"
                  class="form-input"
                  min="0"
                  step="0.5"
                />
                <div *ngIf="setForm.get('weight')?.invalid && setForm.get('weight')?.touched" class="error-text">
                  Weight must be non-negative
                </div>
              </div>

              <div class="form-group">
                <label>RPE (1-10)</label>
                <select formControlName="rpe" class="form-input">
                  <option [ngValue]="null">Optional</option>
                  <option *ngFor="let i of [1,2,3,4,5,6,7,8,9,10]" [value]="i">{{ i }}</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                [disabled]="setForm.invalid || loggingSet()"
                class="btn-primary btn-large"
              >
                {{ loggingSet() ? 'Logging...' : 'Log Set' }}
              </button>
              <button
                type="button"
                (click)="startRestTimer()"
                class="btn-secondary"
                [disabled]="restTimerActive()"
              >
                Start Rest Timer
              </button>
            </div>
          </form>
        </div>

        <!-- Rest Timer -->
        <div *ngIf="restTimerActive()" class="rest-timer">
          <h3>Rest Timer</h3>
          <div class="timer-display">{{ formatTime(restTimeRemaining()) }}</div>
          <div class="timer-actions">
            <button (click)="pauseRestTimer()" *ngIf="!restTimerPaused()" class="btn-secondary">
              Pause
            </button>
            <button (click)="resumeRestTimer()" *ngIf="restTimerPaused()" class="btn-secondary">
              Resume
            </button>
            <button (click)="stopRestTimer()" class="btn-secondary">Stop</button>
          </div>
        </div>

        <!-- Current Workout Sets -->
        <div class="workout-sets" *ngIf="currentSets().length > 0">
          <h3>Today's Sets</h3>
          <div class="sets-list">
            <div *ngFor="let set of currentSets()" class="set-item">
              <div class="set-info">
                <span class="set-number">Set {{ set.setNumber }}</span>
                <span class="exercise-name">{{ set.exerciseName }}</span>
              </div>
              <div class="set-details">
                <span>{{ set.reps }} reps × {{ set.weightKg }} kg</span>
                <span class="volume">= {{ set.volumeLoad }} kg</span>
                <span *ngIf="set.rpe" class="rpe-badge">RPE {{ set.rpe }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Finish Workout -->
        <div class="finish-section">
          <button
            (click)="confirmFinishWorkout()"
            [disabled]="finishingWorkout() || currentSets().length === 0"
            class="btn-danger btn-large"
          >
            {{ finishingWorkout() ? 'Finishing...' : 'Finish Workout' }}
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div *ngIf="error()" class="error-banner">
        {{ error() }}
        <button (click)="error.set(null)" class="btn-close">×</button>
      </div>
    </div>
  `,
  styles: [`
    .workout-session-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .header h2 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .workout-stats {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .stat {
      color: #666;
      font-size: 14px;
    }

    .stat strong {
      color: #333;
    }

    .start-workout {
      text-align: center;
      padding: 60px 20px;
    }

    .start-workout p {
      color: #666;
      margin-bottom: 20px;
    }

    .active-session {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .exercise-selector {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
    }

    .exercise-selector h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .select-large {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      margin-bottom: 15px;
    }

    .previous-data {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }

    .previous-data h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .previous-sets {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .previous-set {
      color: #555;
      font-size: 14px;
    }

    .set-form {
      background: white;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 20px;
    }

    .set-form h3 {
      margin: 0 0 20px 0;
      color: #4CAF50;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .form-input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
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

    .form-actions {
      display: flex;
      gap: 15px;
    }

    .rest-timer {
      background: #fff3e0;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #f57c00;
    }

    .rest-timer h3 {
      margin: 0 0 15px 0;
      color: #f57c00;
    }

    .timer-display {
      font-size: 48px;
      font-weight: bold;
      color: #f57c00;
      margin-bottom: 20px;
    }

    .timer-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    .workout-sets {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
    }

    .workout-sets h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .sets-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .set-item {
      background: white;
      padding: 15px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .set-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .set-number {
      font-weight: 500;
      color: #666;
      font-size: 12px;
    }

    .exercise-name {
      font-weight: 600;
      color: #333;
    }

    .set-details {
      display: flex;
      gap: 15px;
      align-items: center;
      font-size: 14px;
    }

    .volume {
      color: #4CAF50;
      font-weight: 600;
    }

    .rpe, .rpe-badge {
      color: #f57c00;
      font-size: 12px;
    }

    .finish-section {
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
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

    .btn-danger {
      background: #d32f2f;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-danger:hover:not(:disabled) {
      background: #b71c1c;
    }

    .btn-large {
      padding: 15px 30px;
      font-size: 16px;
    }

    .error-banner {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d32f2f;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 400px;
    }

    .btn-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
  `]
})
export class WorkoutSessionComponent implements OnInit, OnDestroy {
  private workoutService = inject(WorkoutService);
  private fb = inject(FormBuilder);

  // Workout state
  currentWorkout = this.workoutService.currentWorkout;
  currentSets = this.workoutService.currentWorkoutSets;
  exercises = signal<Exercise[]>([]);
  selectedExerciseId: number | null = null;
  selectedExercise = signal<Exercise | null>(null);
  previousSets = signal<WorkoutSetResponse[]>([]);

  // Form
  setForm: FormGroup;
  loggingSet = signal<boolean>(false);
  finishingWorkout = signal<boolean>(false);
  error = signal<string | null>(null);

  // Rest timer
  restTimerActive = signal<boolean>(false);
  restTimerPaused = signal<boolean>(false);
  restTimeRemaining = signal<number>(90); // 90 seconds default
  private restTimerInterval: any;
  private workoutStartTime: Date | null = null;

  // Computed
  workoutTitle = computed(() => {
    const workout = this.currentWorkout();
    return workout ? `Active Workout - ${workout.workoutDate}` : 'Workout Session';
  });

  totalVolume = computed(() => {
    return Math.round(this.workoutService.getCurrentWorkoutTotalVolume());
  });

  totalSets = computed(() => {
    return this.workoutService.getCurrentWorkoutTotalSets();
  });

  uniqueExercises = computed(() => {
    return this.workoutService.getUniqueExercisesCount();
  });

  workoutDuration = computed(() => {
    if (!this.workoutStartTime) return '0m';
    const now = new Date();
    const diffMs = now.getTime() - this.workoutStartTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes}m`;
  });

  constructor() {
    this.setForm = this.fb.group({
      reps: [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      rpe: [null]
    });
  }

  ngOnInit(): void {
    this.loadExercises();

    // If there's already an active workout, set the start time
    if (this.currentWorkout()) {
      this.workoutStartTime = new Date(this.currentWorkout()!.startTime);
    }
  }

  ngOnDestroy(): void {
    this.stopRestTimer();
  }

  loadExercises(): void {
    this.workoutService.getAllExercises().subscribe({
      next: (exercises) => {
        this.exercises.set(exercises);
      },
      error: (err) => {
        this.error.set('Failed to load exercises');
        console.error('Error loading exercises:', err);
      }
    });
  }

  startWorkout(): void {
    const today = new Date().toISOString().split('T')[0];

    this.workoutService.startWorkout({ date: today }).subscribe({
      next: () => {
        this.workoutStartTime = new Date();
      },
      error: (err) => {
        this.error.set('Failed to start workout');
        console.error('Error starting workout:', err);
      }
    });
  }

  onExerciseChange(): void {
    if (this.selectedExerciseId) {
      const exercise = this.exercises().find(e => e.id === this.selectedExerciseId);
      this.selectedExercise.set(exercise || null);

      // Load previous workout data
      if (exercise && this.currentWorkout()) {
        this.workoutService.getPreviousWorkoutData(
          this.currentWorkout()!.id,
          exercise.id
        ).subscribe({
          next: (sets) => {
            this.previousSets.set(sets.slice(0, 5)); // Show last 5 sets
          },
          error: (err) => {
            console.error('Error loading previous data:', err);
            this.previousSets.set([]);
          }
        });
      }
    } else {
      this.selectedExercise.set(null);
      this.previousSets.set([]);
    }
  }

  logSet(): void {
    if (this.setForm.invalid || !this.selectedExercise() || !this.currentWorkout()) {
      return;
    }

    this.loggingSet.set(true);
    this.error.set(null);

    const nextSetNumber = this.currentSets().filter(
      s => s.exerciseId === this.selectedExerciseId
    ).length + 1;

    const request: WorkoutSetRequest = {
      exerciseId: this.selectedExerciseId!,
      setNumber: nextSetNumber,
      reps: this.setForm.value.reps,
      weightKg: this.setForm.value.weight,
      rpe: this.setForm.value.rpe
    };

    this.workoutService.logSet(this.currentWorkout()!.id, request).subscribe({
      next: () => {
        this.loggingSet.set(false);
        // Reset form but keep exercise selected
        this.setForm.patchValue({
          reps: 10,
          rpe: null
        });
        this.setForm.markAsUntouched();
      },
      error: (err) => {
        this.error.set('Failed to log set');
        this.loggingSet.set(false);
        console.error('Error logging set:', err);
      }
    });
  }

  startRestTimer(): void {
    this.restTimerActive.set(true);
    this.restTimerPaused.set(false);
    this.restTimeRemaining.set(90);

    this.restTimerInterval = setInterval(() => {
      if (!this.restTimerPaused()) {
        this.restTimeRemaining.update(time => {
          if (time <= 1) {
            this.stopRestTimer();
            return 0;
          }
          return time - 1;
        });
      }
    }, 1000);
  }

  pauseRestTimer(): void {
    this.restTimerPaused.set(true);
  }

  resumeRestTimer(): void {
    this.restTimerPaused.set(false);
  }

  stopRestTimer(): void {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
    }
    this.restTimerActive.set(false);
    this.restTimerPaused.set(false);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  confirmFinishWorkout(): void {
    if (!confirm('Are you sure you want to finish this workout?')) {
      return;
    }

    this.finishWorkout();
  }

  finishWorkout(): void {
    if (!this.currentWorkout()) return;

    this.finishingWorkout.set(true);
    this.error.set(null);

    this.workoutService.finishWorkout(this.currentWorkout()!.id).subscribe({
      next: () => {
        this.finishingWorkout.set(false);
        this.workoutStartTime = null;
        this.selectedExerciseId = null;
        this.selectedExercise.set(null);
        this.previousSets.set([]);
        alert('Workout completed successfully!');
      },
      error: (err) => {
        this.error.set('Failed to finish workout');
        this.finishingWorkout.set(false);
        console.error('Error finishing workout:', err);
      }
    });
  }

  browseExercises(): void {
    // TODO: Navigate to exercise list or open modal
    alert('Exercise browser coming soon!');
  }
}
