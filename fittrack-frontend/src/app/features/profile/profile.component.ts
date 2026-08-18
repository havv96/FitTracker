import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileRequest, ProfileResponse } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { MetricsService } from '../../core/services/metrics.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtCardComponent } from '../../shared/ui/ft-card.component';
import { FtEmptyStateComponent } from '../../shared/ui/ft-empty-state.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';
import { FtStatCardComponent } from '../../shared/ui/ft-stat-card.component';
import { FtTagComponent } from '../../shared/ui/ft-tag.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FtButtonComponent,
    FtCardComponent,
    FtEmptyStateComponent,
    FtFormFieldComponent,
    FtIconComponent,
    FtStatCardComponent,
    FtTagComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private metricsService = inject(MetricsService);

  profileForm!: FormGroup;
  profile: ProfileResponse | null = null;
  latestWeightKg: number | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  readonly genderOptions = [
    { value: 'MALE', label: $localize`:@@profile.gender.male:Male` },
    { value: 'FEMALE', label: $localize`:@@profile.gender.female:Female` },
  ];

  readonly activityLevelOptions = [
    {
      value: 'SEDENTARY',
      label: $localize`:@@profile.activity.sedentary:Sedentary`,
      description: $localize`:@@profile.activity.sedentaryDesc:Little or no exercise.`,
    },
    {
      value: 'LIGHTLY_ACTIVE',
      label: $localize`:@@profile.activity.light:Lightly active`,
      description: $localize`:@@profile.activity.lightDesc:Light exercise 1–3 days/week.`,
    },
    {
      value: 'MODERATELY_ACTIVE',
      label: $localize`:@@profile.activity.moderate:Moderately active`,
      description: $localize`:@@profile.activity.moderateDesc:Moderate exercise 3–5 days/week.`,
    },
    {
      value: 'VERY_ACTIVE',
      label: $localize`:@@profile.activity.very:Very active`,
      description: $localize`:@@profile.activity.veryDesc:Hard exercise 6–7 days/week.`,
    },
    {
      value: 'EXTRA_ACTIVE',
      label: $localize`:@@profile.activity.extra:Extra active`,
      description: $localize`:@@profile.activity.extraDesc:Very hard exercise & physical job.`,
    },
  ];

  readonly weightGoalOptions = [
    { value: 'LOSE_FAST', label: $localize`:@@profile.goal.loseFast:Lose fast`, description: '-0.75 kg/wk' },
    { value: 'LOSE_MODERATE', label: $localize`:@@profile.goal.loseMod:Lose moderate`, description: '-0.5 kg/wk' },
    { value: 'LOSE_SLOW', label: $localize`:@@profile.goal.loseSlow:Lose slow`, description: '-0.25 kg/wk' },
    { value: 'MAINTAIN', label: $localize`:@@profile.goal.maintain:Maintain`, description: '±0 kg/wk' },
    { value: 'GAIN_SLOW', label: $localize`:@@profile.goal.gainSlow:Gain slow`, description: '+0.25 kg/wk' },
    { value: 'GAIN_MODERATE', label: $localize`:@@profile.goal.gainMod:Gain moderate`, description: '+0.5 kg/wk' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfile();
  }

  initializeForm(): void {
    this.profileForm = this.fb.group({
      heightCm: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      activityLevel: ['', Validators.required],
      weightGoal: ['', Validators.required],
      targetWeightKg: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      currentWeightKg: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.metricsService.getBodyMetrics().subscribe({
      next: (metrics) => {
        this.latestWeightKg = this.pickLatestWeight(metrics);
      },
      error: () => {
        this.latestWeightKg = null;
      },
    });

    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (this.isProfileUnset(response)) {
          // Backend now auto-creates a blank profile row on signup; treat it as "not set up yet"
          // so the setup form renders (no cancel button, no null-valued hero card).
          this.profile = null;
          this.isEditMode = true;
        } else {
          this.profile = response;
          this.populateForm(response);
          this.isEditMode = false;
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.isEditMode = true;
        } else {
          this.errorMessage = $localize`:@@profile.errorLoad:Could not load your profile.`;
        }
        this.isLoading = false;
      },
    });
  }

  private isProfileUnset(profile: ProfileResponse): boolean {
    return (
      profile.heightCm == null &&
      !profile.dateOfBirth &&
      !profile.gender &&
      !profile.activityLevel &&
      !profile.weightGoal &&
      profile.targetWeightKg == null
    );
  }

  populateForm(profile: ProfileResponse): void {
    this.profileForm.patchValue({
      heightCm: profile.heightCm,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      weightGoal: profile.weightGoal,
      targetWeightKg: profile.targetWeightKg,
      currentWeightKg: this.latestWeightKg,
    });
  }

  private pickLatestWeight(metrics: { date: string; weightKg: number }[]): number | null {
    if (!metrics || metrics.length === 0) return null;
    const sorted = [...metrics].sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted[0]?.weightKg ?? null;
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.isEditMode && this.profile) {
      this.populateForm(this.profile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.errorMessage = $localize`:@@profile.errorRequired:Please fill in every field.`;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ProfileRequest = this.profileForm.value;

    this.profileService.createOrUpdateProfile(request).subscribe({
      next: (response) => {
        this.profile = response;
        this.successMessage = $localize`:@@profile.saved:Profile saved.`;
        this.isEditMode = false;
        this.isLoading = false;

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ||
          $localize`:@@profile.errorSave:Could not save your profile. Please try again.`;
        this.isLoading = false;
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => formGroup.get(key)?.markAsTouched());
  }

  fieldTouched(name: string): boolean {
    const c = this.profileForm.get(name);
    return !!(c && c.invalid && c.touched);
  }

  getActivityLevelLabel(value: string): string {
    return this.activityLevelOptions.find((o) => o.value === value)?.label || value;
  }

  getWeightGoalLabel(value: string): string {
    return this.weightGoalOptions.find((o) => o.value === value)?.label || value;
  }

  getGenderLabel(value: string): string {
    return this.genderOptions.find((o) => o.value === value)?.label || value;
  }

  calculateAge(dateOfBirth: string | undefined | null): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
