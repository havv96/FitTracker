import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyticsSummary, BodyMetrics } from '../../core/models/metrics.model';
import { MetricsService } from '../../core/services/metrics.service';
import { BodyMetricsModalComponent } from '../../shared/components/body-metrics-modal.component';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtProgressBarComponent } from '../../shared/ui/ft-progress-bar.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';
import { FtActivityRingsComponent, Ring } from '../../shared/viz/ft-activity-rings.component';
import { ChartPoint, FtAreaChartComponent } from '../../shared/viz/ft-area-chart.component';
import { FtSparklineComponent } from '../../shared/viz/ft-sparkline.component';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BodyMetricsModalComponent,
    FtButtonComponent,
    FtCardComponent,
    FtEmptyStateComponent,
    FtIconComponent,
    FtProgressBarComponent,
    FtStatCardComponent,
    FtTagComponent,
    FtActivityRingsComponent,
    FtAreaChartComponent,
    FtSparklineComponent,
  ],
  templateUrl: './progress-dashboard.component.html',
  styleUrls: ['./progress-dashboard.component.scss'],
})
export class ProgressDashboardComponent implements OnInit {
  private metricsService = inject(MetricsService);
  private confirmDialog = inject(ConfirmDialogService);

  readonly summary = signal<AnalyticsSummary | null>(null);
  readonly bodyMetrics = signal<BodyMetrics[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly showModal = signal<boolean>(false);
  readonly editingMetric = signal<BodyMetrics | undefined>(undefined);

  readonly rings = computed<Ring[]>(() => {
    const s = this.summary();
    if (!s) return [];
    return [
      { value: Math.min(s.consistencyStreak, 30), max: 30, tone: 'accent' },
      { value: s.calorieCompliance, max: 100, tone: 'success' },
      { value: s.proteinCompliance, max: 100, tone: 'warn' },
    ];
  });

  readonly weightPoints = computed<ChartPoint[]>(() => {
    const list = this.bodyMetrics().slice().sort((a, b) => a.date.localeCompare(b.date));
    if (list.length === 0) return [];
    const weights = list.map((m) => m.weightKg);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;
    return list.map((m, i) => ({
      x: list.length === 1 ? 0.5 : i / (list.length - 1),
      y: (m.weightKg - min) / range,
    }));
  });

  readonly latestWeight = computed(() => {
    const list = this.bodyMetrics();
    if (!list.length) return null;
    return [...list].sort((a, b) => b.date.localeCompare(a.date))[0];
  });

  readonly weightDeltaLabel = computed(() => {
    const list = [...this.bodyMetrics()].sort((a, b) => a.date.localeCompare(b.date));
    if (list.length < 2) return null;
    const diff = list[list.length - 1].weightKg - list[0].weightKg;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} kg`;
  });

  readonly volumeSeries = computed<number[]>(() => {
    return this.summary()?.recentProgress?.map((w) => w.totalVolume) ?? [];
  });

  readonly latestVolume = computed(() => {
    const arr = this.volumeSeries();
    if (!arr.length) return null;
    return `${arr[arr.length - 1].toLocaleString()} kg`;
  });

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);
    this.metricsService.getAnalyticsSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.bodyMetrics.set(data.bodyMetrics || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set($localize`:@@analytics.errorLoad:Could not load analytics.`);
        this.loading.set(false);
        console.error('Error loading analytics:', err);
      },
    });
  }

  formatVolume(volume: number): string {
    if (volume >= 1000) return `${Math.round(volume / 100) / 10}k kg`;
    return `${Math.round(volume)} kg`;
  }

  formatWeek(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
      title: $localize`:@@analytics.deleteTitle:Delete entry?`,
      message: $localize`:@@analytics.deleteMessage:This will remove the body metric permanently.`,
      confirmText: $localize`:@@common.delete:Delete`,
      danger: true,
    });
    if (!confirmed) return;

    this.metricsService.deleteBodyMetrics(id).subscribe({
      next: () => this.loadAllData(),
      error: (err) => {
        this.error.set($localize`:@@analytics.errorDelete:Could not delete metric.`);
        console.error('Error deleting metric:', err);
      },
    });
  }
}
