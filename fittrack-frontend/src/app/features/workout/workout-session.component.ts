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
  templateUrl: './workout-session.component.html',
  styleUrls: ['./workout-session.component.scss']
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
