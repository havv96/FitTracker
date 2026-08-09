import { Component, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MetricsService } from '../../core/services/metrics.service';
import { BodyMetrics, BodyMetricsRequest } from '../../core/models/metrics.model';

@Component({
  selector: 'app-body-metrics-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ existingMetric ? 'Edit Body Metrics' : 'Add Body Metrics' }}</h2>
        </div>

        <form [formGroup]="metricsForm" (ngSubmit)="onSubmit()">
          <!-- Date & Weight row -->
          <div class="form-row">
            <div class="form-group">
              <label for="date">Date *</label>
              <input
                id="date"
                type="date"
                formControlName="date"
                class="form-input"
              />
              <div *ngIf="metricsForm.get('date')?.invalid && metricsForm.get('date')?.touched" class="error-text">
                Date is required
              </div>
            </div>

            <div class="form-group">
              <label for="weightKg">Weight (kg) *</label>
              <input
                id="weightKg"
                type="number"
                formControlName="weightKg"
                class="form-input"
                placeholder="e.g. 75.5"
                step="0.1"
              />
              <div *ngIf="metricsForm.get('weightKg')?.invalid && metricsForm.get('weightKg')?.touched" class="error-text">
                Weight is required and must be at least 1 kg
              </div>
            </div>
          </div>

          <!-- Body composition row -->
          <div class="form-row">
            <div class="form-group">
              <label for="bodyFatPercentage">Body Fat (%)</label>
              <input
                id="bodyFatPercentage"
                type="number"
                formControlName="bodyFatPercentage"
                class="form-input"
                placeholder="e.g. 18.5"
                step="0.1"
              />
            </div>

            <div class="form-group">
              <label for="muscleMassKg">Muscle Mass (kg)</label>
              <input
                id="muscleMassKg"
                type="number"
                formControlName="muscleMassKg"
                class="form-input"
                placeholder="e.g. 35.0"
                step="0.1"
              />
            </div>
          </div>

          <!-- Circumference measurements row -->
          <div class="form-row">
            <div class="form-group">
              <label for="waistCm">Waist (cm)</label>
              <input
                id="waistCm"
                type="number"
                formControlName="waistCm"
                class="form-input"
                placeholder="e.g. 80"
                step="0.1"
              />
            </div>

            <div class="form-group">
              <label for="chestCm">Chest (cm)</label>
              <input
                id="chestCm"
                type="number"
                formControlName="chestCm"
                class="form-input"
                placeholder="e.g. 100"
                step="0.1"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="armsCm">Arms (cm)</label>
              <input
                id="armsCm"
                type="number"
                formControlName="armsCm"
                class="form-input"
                placeholder="e.g. 35"
                step="0.1"
              />
            </div>

            <div class="form-group">
              <label for="legsCm">Legs (cm)</label>
              <input
                id="legsCm"
                type="number"
                formControlName="legsCm"
                class="form-input"
                placeholder="e.g. 55"
                step="0.1"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              class="form-input form-textarea"
              placeholder="Optional notes about this measurement..."
              rows="3"
            ></textarea>
          </div>

          <!-- Error banner -->
          <div *ngIf="errorMessage" class="error-banner">
            {{ errorMessage }}
          </div>

          <!-- Footer buttons -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn-secondary"
              (click)="onCancel()"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="btn-primary"
              [disabled]="metricsForm.invalid || loading"
            >
              {{ loading ? 'Saving...' : (existingMetric ? 'Update' : 'Add Entry') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      margin-bottom: 30px;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #4CAF50;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-text {
      color: #d32f2f;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-banner {
      background: #ffebee;
      color: #d32f2f;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
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
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-secondary:hover {
      border-color: #999;
      color: #333;
    }

    @media (max-width: 480px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .modal-card {
        padding: 24px;
      }
    }
  `]
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
