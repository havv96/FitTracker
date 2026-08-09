import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MetricsService } from '../../core/services/metrics.service';
import { WorkoutService } from '../../core/services/workout.service';
import { NutritionService } from '../../core/services/nutrition.service';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  AnalyticsSummary,
  WeeklyProgress,
  BodyMetrics
} from '../../core/models/metrics.model';
import { BodyMetricsModalComponent } from '../../shared/components/body-metrics-modal.component';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BodyMetricsModalComponent],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss']
})
export class ProgressDashboardComponent implements OnInit {
  private metricsService = inject(MetricsService);
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private confirmDialog = inject(ConfirmDialogService);

  // State
  summary = signal<AnalyticsSummary | null>(null);
  weeklyProgress = signal<WeeklyProgress[]>([]);
  bodyMetrics = signal<BodyMetrics[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showModal = signal<boolean>(false);
  editingMetric = signal<BodyMetrics | undefined>(undefined);

  // Computed
  weightChange = computed(() => {
    const metrics = this.bodyMetrics();
    return this.metricsService.calculateWeightChange(metrics);
  });

  weightTrend = computed(() => {
    return this.metricsService.getWeightTrend(this.bodyMetrics());
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);

    // Load analytics summary
    this.metricsService.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.weeklyProgress.set(data.recentProgress || []);
        this.bodyMetrics.set(data.bodyMetrics || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load progress data');
        this.loading.set(false);
        console.error('Error loading analytics:', err);
      }
    });
  }

  formatVolume(volume: number): string {
    if (volume >= 1000) {
      return `${Math.round(volume / 100) / 10}k kg`;
    }
    return `${Math.round(volume)} kg`;
  }

  formatWeek(dateString: string): string {
    const date = new Date(dateString);
    return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getWeightChangeClass(): string {
    const change = this.weightChange().total;
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return '';
  }

  getTrendEmoji(): string {
    const trend = this.weightTrend();
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  }

  showAddMetrics(): void {
    this.editingMetric.set(undefined);
    this.showModal.set(true);
  }

  showEditMetrics(metric: BodyMetrics): void {
    this.editingMetric.set(metric);
    this.showModal.set(true);
  }

  onMetricsSaved(): void {
    this.showModal.set(false);
    this.editingMetric.set(undefined);
    this.loadAllData();
  }

  onModalCancelled(): void {
    this.showModal.set(false);
    this.editingMetric.set(undefined);
  }

  async deleteMetric(id: number): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete entry?',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      danger: true
    });
    if (!confirmed) return;

    this.metricsService.deleteBodyMetrics(id).subscribe({
      next: () => {
        this.loadAllData();
      },
      error: (err) => {
        this.error.set('Failed to delete metric');
        console.error('Error deleting metric:', err);
      }
    });
  }
}
