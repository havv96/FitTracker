import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetricsService } from '../../core/services/metrics.service';
import { BodyMetrics, BodyMetricsRequest } from '../../core/models/metrics.model';

@Component({
  selector: 'app-body-metrics-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './body-metrics-modal.component.html',
  styleUrls: ['./body-metrics-modal.component.scss']
})
export class BodyMetricsModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private metricsService = inject(MetricsService);

  @Input() existingMetric: BodyMetrics | null | undefined = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  metricsForm!: FormGroup;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.metricsForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      weightKg: [null, [Validators.required, Validators.min(1)]],
      bodyFatPercentage: [null],
      muscleMassKg: [null],
      waistCm: [null],
      chestCm: [null],
      armsCm: [null],
      legsCm: [null],
      notes: ['']
    });

    if (this.existingMetric) {
      this.metricsForm.patchValue({
        date: this.existingMetric.date,
        weightKg: this.existingMetric.weightKg,
        bodyFatPercentage: this.existingMetric.bodyFatPercentage ?? null,
        muscleMassKg: this.existingMetric.muscleMassKg ?? null,
        waistCm: this.existingMetric.waistCm ?? null,
        chestCm: this.existingMetric.chestCm ?? null,
        armsCm: this.existingMetric.armsCm ?? null,
        legsCm: this.existingMetric.legsCm ?? null,
        notes: this.existingMetric.notes ?? ''
      });
    }
  }

  onSubmit(): void {
    if (this.metricsForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.metricsForm.value;

    const request: BodyMetricsRequest = {
      date: formValue.date,
      weightKg: Number(formValue.weightKg),
      ...(formValue.bodyFatPercentage !== null && formValue.bodyFatPercentage !== '' && { bodyFatPercentage: Number(formValue.bodyFatPercentage) }),
      ...(formValue.muscleMassKg !== null && formValue.muscleMassKg !== '' && { muscleMassKg: Number(formValue.muscleMassKg) }),
      ...(formValue.waistCm !== null && formValue.waistCm !== '' && { waistCm: Number(formValue.waistCm) }),
      ...(formValue.chestCm !== null && formValue.chestCm !== '' && { chestCm: Number(formValue.chestCm) }),
      ...(formValue.armsCm !== null && formValue.armsCm !== '' && { armsCm: Number(formValue.armsCm) }),
      ...(formValue.legsCm !== null && formValue.legsCm !== '' && { legsCm: Number(formValue.legsCm) }),
      ...(formValue.notes && formValue.notes.trim() ? { notes: formValue.notes.trim() } : {})
    };

    const operation = this.existingMetric?.id
      ? this.metricsService.updateBodyMetrics(this.existingMetric.id, request)
      : this.metricsService.addBodyMetrics(request);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to save body metrics. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
