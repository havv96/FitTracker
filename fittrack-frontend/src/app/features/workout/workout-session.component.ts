import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Exercise,
  WorkoutSetRequest,
  WorkoutSetResponse,
} from '../../core/models/workout.model';
import { WorkoutService } from '../../core/services/workout.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtProgressBarComponent } from '../../shared/ui/ft-progress-bar.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';

const REST_DEFAULT = 90;

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtEmptyStateComponent,
    FtFormFieldComponent,
    FtIconComponent,
    FtProgressBarComponent,
    FtStatCardComponent,
    FtTagComponent,
  ],
  templateUrl: './workout-session.component.html',
  styleUrls: ['./workout-session.component.scss'],
})
export class WorkoutSessionComponent implements OnInit, OnDestroy {
  private workoutService = inject(WorkoutService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly currentWorkout = this.workoutService.currentWorkout;
  readonly currentSets = this.workoutService.currentWorkoutSets;
  readonly exercises = signal<Exercise[]>([]);
  selectedExerciseId: number | null = null;
  readonly selectedExercise = signal<Exercise | null>(null);
  readonly previousSets = signal<WorkoutSetResponse[]>([]);

  setForm: FormGroup;
  readonly loggingSet = signal<boolean>(false);
  readonly finishingWorkout = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly starting = signal<boolean>(false);

  readonly restTimerActive = signal<boolean>(false);
  readonly restTimerPaused = signal<boolean>(false);
  readonly restTimeRemaining = signal<number>(REST_DEFAULT);
  private restTimerInterval: ReturnType<typeof setInterval> | null = null;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private readonly nowMs = signal<number>(Date.now());

  readonly restProgressPct = computed(() =>
    ((REST_DEFAULT - this.restTimeRemaining()) / REST_DEFAULT) * 100,
  );

  readonly totalVolume = computed(() =>
    Math.round(this.workoutService.getCurrentWorkoutTotalVolume()),
  );
  readonly totalSets = computed(() => this.workoutService.getCurrentWorkoutTotalSets());
  readonly uniqueExercises = computed(() => this.workoutService.getUniqueExercisesCount());

  readonly workoutStartMs = computed(() => {
    const w = this.currentWorkout();
    return w?.startTime ? new Date(w.startTime).getTime() : null;
  });

  readonly durationLabel = computed(() => {
    const start = this.workoutStartMs();
    if (!start) return '0:00';
    const seconds = Math.max(0, Math.floor((this.nowMs() - start) / 1000));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  readonly currentExerciseSets = computed(() => {
    const eid = this.selectedExerciseId;
    if (!eid) return [] as WorkoutSetResponse[];
    return this.currentSets().filter((s) => s.exerciseId === eid);
  });

  readonly nextSetNumber = computed(() => this.currentExerciseSets().length + 1);

  constructor() {
    this.setForm = this.fb.group({
      reps: [10, [Validators.required, Validators.min(1), Validators.max(1000)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      rpe: [null],
    });
  }

  ngOnInit(): void {
    this.loadExercises();
    this.tickInterval = setInterval(() => this.nowMs.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.stopRestTimer();
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  loadExercises(): void {
    this.workoutService.getAllExercises().subscribe({
      next: (exercises) => this.exercises.set(exercises),
      error: (err) => {
        this.error.set($localize`:@@workout.errorLoadExercises:Could not load exercises.`);
        console.error('Error loading exercises:', err);
      },
    });
  }

  startWorkout(): void {
    const today = new Date().toISOString().split('T')[0];
    this.starting.set(true);
    this.workoutService.startWorkout({ date: today }).subscribe({
      next: () => this.starting.set(false),
      error: (err) => {
        this.starting.set(false);
        this.error.set($localize`:@@workout.errorStart:Could not start workout.`);
        console.error('Error starting workout:', err);
      },
    });
  }

  onExerciseChange(): void {
    if (this.selectedExerciseId) {
      const exercise = this.exercises().find((e) => e.id === this.selectedExerciseId) ?? null;
      this.selectedExercise.set(exercise);

      if (exercise && this.currentWorkout()) {
        this.workoutService
          .getPreviousWorkoutData(this.currentWorkout()!.id, exercise.id)
          .subscribe({
            next: (sets) => this.previousSets.set(sets.slice(0, 5)),
            error: (err) => {
              console.error('Error loading previous data:', err);
              this.previousSets.set([]);
            },
          });
      }
    } else {
      this.selectedExercise.set(null);
      this.previousSets.set([]);
    }
  }

  logSet(): void {
    if (this.setForm.invalid || !this.selectedExercise() || !this.currentWorkout()) {
      this.setForm.markAllAsTouched();
      return;
    }

    this.loggingSet.set(true);
    this.error.set(null);

    const request: WorkoutSetRequest = {
      exerciseId: this.selectedExerciseId!,
      setNumber: this.nextSetNumber(),
      reps: this.setForm.value.reps,
      weightKg: this.setForm.value.weight,
      rpe: this.setForm.value.rpe,
    };

    this.workoutService.logSet(this.currentWorkout()!.id, request).subscribe({
      next: () => {
        this.loggingSet.set(false);
        this.setForm.patchValue({ reps: 10, rpe: null });
        this.setForm.markAsUntouched();
        this.startRestTimer();
      },
      error: (err) => {
        this.error.set($localize`:@@workout.errorLogSet:Could not log set.`);
        this.loggingSet.set(false);
        console.error('Error logging set:', err);
      },
    });
  }

  startRestTimer(): void {
    this.stopRestTimer();
    this.restTimerActive.set(true);
    this.restTimerPaused.set(false);
    this.restTimeRemaining.set(REST_DEFAULT);

    this.restTimerInterval = setInterval(() => {
      if (!this.restTimerPaused()) {
        this.restTimeRemaining.update((t) => {
          if (t <= 1) {
            this.stopRestTimer();
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
  }

  togglePause(): void {
    this.restTimerPaused.update((p) => !p);
  }

  stopRestTimer(): void {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = null;
    }
    this.restTimerActive.set(false);
    this.restTimerPaused.set(false);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async confirmFinishWorkout(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: $localize`:@@workout.finishTitle:Finish workout?`,
      message: $localize`:@@workout.finishMessage:This will end the current session and archive all logged sets.`,
      confirmText: $localize`:@@workout.finishConfirm:Finish`,
    });
    if (confirmed) this.finishWorkout();
  }

  finishWorkout(): void {
    if (!this.currentWorkout()) return;
    this.finishingWorkout.set(true);
    this.error.set(null);

    this.workoutService.finishWorkout(this.currentWorkout()!.id).subscribe({
      next: () => {
        this.finishingWorkout.set(false);
        this.selectedExerciseId = null;
        this.selectedExercise.set(null);
        this.previousSets.set([]);
        this.stopRestTimer();
        this.toast.success($localize`:@@workout.finishedToast:Workout completed.`);
      },
      error: (err) => {
        this.error.set($localize`:@@workout.errorFinish:Could not finish workout.`);
        this.finishingWorkout.set(false);
        console.error('Error finishing workout:', err);
      },
    });
  }
}
