import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { Exercise, MuscleGroup, EquipmentType } from '../../core/models/workout.model';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercise-list-container">
      <div class="header">
        <h2>Exercise Library</h2>
        <p class="subtitle">Browse and search exercises for your workout</p>
      </div>

      <!-- Search and Filters -->
      <div class="filters">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search exercises..."
            class="search-input"
          />
        </div>

        <div class="filter-row">
          <select [(ngModel)]="selectedMuscleGroup" (ngModelChange)="onFilterChange()" class="filter-select">
            <option [ngValue]="null">All Muscle Groups</option>
            <option *ngFor="let group of muscleGroups" [value]="group">{{ group }}</option>
          </select>

          <select [(ngModel)]="selectedEquipment" (ngModelChange)="onFilterChange()" class="filter-select">
            <option [ngValue]="null">All Equipment</option>
            <option *ngFor="let equipment of equipmentTypes" [value]="equipment">{{ equipment }}</option>
          </select>

          <button (click)="clearFilters()" class="btn-secondary" *ngIf="hasFilters()">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading">
        <p>Loading exercises...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="error">
        <p>{{ error() }}</p>
        <button (click)="loadExercises()" class="btn-primary">Retry</button>
      </div>

      <!-- Exercise Grid -->
      <div *ngIf="!loading() && !error()" class="exercise-grid">
        <div
          *ngFor="let exercise of exercises()"
          class="exercise-card"
          (click)="selectExercise(exercise)"
          [class.selected]="selectedExercise()?.id === exercise.id"
        >
          <div class="exercise-header">
            <h3>{{ exercise.name }}</h3>
            <span class="badge muscle-group">{{ exercise.muscleGroup }}</span>
          </div>
          <div class="exercise-details">
            <span class="badge equipment">{{ exercise.equipmentType }}</span>
            <p *ngIf="exercise.description" class="description">{{ exercise.description }}</p>
          </div>
        </div>

        <div *ngIf="exercises().length === 0" class="no-results">
          <p>No exercises found matching your criteria.</p>
          <button (click)="clearFilters()" class="btn-secondary">Clear Filters</button>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages() > 1" class="pagination">
        <button
          (click)="previousPage()"
          [disabled]="currentPage() === 0"
          class="btn-secondary"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ currentPage() + 1 }} of {{ totalPages() }}
        </span>
        <button
          (click)="nextPage()"
          [disabled]="currentPage() >= totalPages() - 1"
          class="btn-secondary"
        >
          Next
        </button>
      </div>

      <!-- Selected Exercise Details -->
      <div *ngIf="selectedExercise()" class="selected-details">
        <h3>{{ selectedExercise()!.name }}</h3>
        <div class="details-content">
          <p><strong>Muscle Group:</strong> {{ selectedExercise()!.muscleGroup }}</p>
          <p><strong>Equipment:</strong> {{ selectedExercise()!.equipmentType }}</p>
          <p *ngIf="selectedExercise()!.description">
            <strong>Description:</strong> {{ selectedExercise()!.description }}
          </p>
        </div>
        <div class="actions">
          <button (click)="addToWorkout()" class="btn-primary">Add to Workout</button>
          <button (click)="closeDetails()" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .exercise-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 30px;
    }

    .header h2 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .subtitle {
      color: #666;
      margin: 0;
    }

    .filters {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .search-box {
      margin-bottom: 15px;
    }

    .search-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    .filter-row {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .filter-select {
      flex: 1;
      min-width: 200px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .exercise-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .exercise-card:hover {
      border-color: #4CAF50;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .exercise-card.selected {
      border-color: #4CAF50;
      background: #f1f8f4;
    }

    .exercise-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
    }

    .exercise-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .exercise-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;
    }

    .badge.muscle-group {
      background: #e3f2fd;
      color: #1976d2;
    }

    .badge.equipment {
      background: #fff3e0;
      color: #f57c00;
    }

    .description {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .loading, .error, .no-results {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error {
      color: #d32f2f;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin: 30px 0;
    }

    .page-info {
      color: #666;
      font-weight: 500;
    }

    .selected-details {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 2px solid #4CAF50;
      padding: 20px;
      box-shadow: 0 -4px 8px rgba(0,0,0,0.1);
    }

    .selected-details h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .details-content {
      margin-bottom: 15px;
    }

    .details-content p {
      margin: 5px 0;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 10px;
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

    .btn-primary:hover {
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

    .btn-secondary:hover {
      border-color: #999;
      color: #333;
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
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
