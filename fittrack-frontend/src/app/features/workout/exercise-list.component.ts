import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { Exercise, MuscleGroup, EquipmentType } from '../../core/models/workout.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  // State
  exercises = signal<Exercise[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  selectedExercise = signal<Exercise | null>(null);

  // Filters
  searchTerm: string = '';
  selectedMuscleGroup: string | null = null;
  selectedEquipment: string | null = null;

  // Pagination
  currentPage = signal<number>(0);
  totalPages = signal<number>(1);
  pageSize = 20;

  // Options
  muscleGroups = Object.values(MuscleGroup);
  equipmentTypes = Object.values(EquipmentType);

  // Debounce timer for search
  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.loading.set(true);
    this.error.set(null);

    this.workoutService.searchExercises({
      muscleGroup: this.selectedMuscleGroup || undefined,
      equipmentType: this.selectedEquipment || undefined,
      searchTerm: this.searchTerm || undefined,
      page: this.currentPage(),
      size: this.pageSize
    }).subscribe({
      next: (response) => {
        this.exercises.set(response.content);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load exercises. Please try again.');
        this.loading.set(false);
        console.error('Error loading exercises:', err);
      }
    });
  }

  onSearchChange(term: string): void {
    // Debounce search input
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.currentPage.set(0);
      this.loadExercises();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadExercises();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedMuscleGroup = null;
    this.selectedEquipment = null;
    this.currentPage.set(0);
    this.loadExercises();
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedMuscleGroup || this.selectedEquipment);
  }

  selectExercise(exercise: Exercise): void {
    this.selectedExercise.set(exercise);
  }

  closeDetails(): void {
    this.selectedExercise.set(null);
  }

  addToWorkout(): void {
    const exercise = this.selectedExercise();
    if (exercise) {
      // TODO: Emit event to parent component or navigate to workout session
      console.log('Adding to workout:', exercise);
      alert(`Added ${exercise.name} to workout!`);
      this.closeDetails();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(page => page - 1);
      this.loadExercises();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(page => page + 1);
      this.loadExercises();
    }
  }
}
