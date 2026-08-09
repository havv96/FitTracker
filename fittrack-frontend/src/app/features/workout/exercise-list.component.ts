import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquipmentType, Exercise, MuscleGroup } from '../../core/models/workout.model';
import { WorkoutService } from '../../core/services/workout.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtChipComponent } from '../../shared/ui/ft-chip.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtChipComponent,
    FtEmptyStateComponent,
    FtIconComponent,
    FtTagComponent,
  ],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss'],
})
export class ExerciseListComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  exercises = signal<Exercise[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedExercise = signal<Exercise | null>(null);

  searchTerm = '';
  selectedMuscleGroup = signal<string | null>(null);
  selectedEquipment = signal<string | null>(null);

  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  pageSize = 20;

  readonly muscleGroups = Object.values(MuscleGroup);
  readonly equipmentTypes = Object.values(EquipmentType);

  readonly hasFilters = computed(
    () => !!(this.searchTerm || this.selectedMuscleGroup() || this.selectedEquipment()),
  );

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading.set(true);
    this.error.set(null);

    this.workoutService
      .searchExercises({
        muscleGroup: this.selectedMuscleGroup() || undefined,
        equipmentType: this.selectedEquipment() || undefined,
        searchTerm: this.searchTerm || undefined,
        page: this.currentPage(),
        size: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.exercises.set(response.content);
          this.totalPages.set(response.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(
            $localize`:@@exerciseList.errorLoad:Could not load exercises. Please retry.`,
          );
          this.loading.set(false);
          console.error('Error loading exercises:', err);
        },
      });
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(0);
      this.loadExercises();
    }, 300);
  }

  toggleMuscle(group: string | null): void {
    this.selectedMuscleGroup.update((current) => (current === group ? null : group));
    this.currentPage.set(0);
    this.loadExercises();
  }

  toggleEquipment(eq: string | null): void {
    this.selectedEquipment.update((current) => (current === eq ? null : eq));
    this.currentPage.set(0);
    this.loadExercises();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedMuscleGroup.set(null);
    this.selectedEquipment.set(null);
    this.currentPage.set(0);
    this.loadExercises();
  }

  selectExercise(exercise: Exercise): void {
    this.selectedExercise.set(exercise);
  }

  closeDetails(): void {
    this.selectedExercise.set(null);
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
      this.loadExercises();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
      this.loadExercises();
    }
  }
}
