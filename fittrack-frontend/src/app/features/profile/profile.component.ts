import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { ProfileRequest, ProfileResponse } from '../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  profileForm!: FormGroup;
  profile: ProfileResponse | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Dropdown options
  genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  activityLevelOptions = [
    { value: 'SEDENTARY', label: 'Sedentary (little or no exercise)', description: 'Desk job, minimal activity' },
    { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
    { value: 'MODERATELY_ACTIVE', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
    { value: 'VERY_ACTIVE', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'EXTRA_ACTIVE', label: 'Extra Active', description: 'Very hard exercise & physical job' }
  ];

  weightGoalOptions = [
    { value: 'LOSE_FAST', label: 'Lose Weight Fast', description: '-0.75 kg/week' },
    { value: 'LOSE_MODERATE', label: 'Lose Weight Moderately', description: '-0.5 kg/week' },
    { value: 'LOSE_SLOW', label: 'Lose Weight Slowly', description: '-0.25 kg/week' },
    { value: 'MAINTAIN', label: 'Maintain Weight', description: 'Stay at current weight' },
    { value: 'GAIN_SLOW', label: 'Gain Weight Slowly', description: '+0.25 kg/week' },
    { value: 'GAIN_MODERATE', label: 'Gain Weight Moderately', description: '+0.5 kg/week' }
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
      currentWeightKg: [null, [Validators.required, Validators.min(30), Validators.max(300)]]
    });
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profile = response;
        this.populateForm(response);
        this.isLoading = false;
        this.isEditMode = false;
      },
      error: (error) => {
        // Profile doesn't exist yet, enable edit mode to create one
        if (error.status === 404) {
          this.isEditMode = true;
        } else {
          this.errorMessage = 'Failed to load profile. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  populateForm(profile: ProfileResponse): void {
    this.profileForm.patchValue({
      heightCm: profile.heightCm,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      activityLevel: profile.activityLevel,
      weightGoal: profile.weightGoal,
      targetWeightKg: profile.targetWeightKg,
      currentWeightKg: 70 // Default value, should be from daily stats
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isEditMode && this.profile) {
      // Cancel editing - restore original values
      this.populateForm(this.profile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: ProfileRequest = this.profileForm.value;

    this.profileService.createOrUpdateProfile(request).subscribe({
      next: (response) => {
        this.profile = response;
        this.successMessage = 'Profile saved successfully!';
        this.isEditMode = false;
        this.isLoading = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to save profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
    }
    return '';
  }

  // Utility methods for template
  getActivityLevelLabel(value: string): string {
    return this.activityLevelOptions.find(opt => opt.value === value)?.label || value;
  }

  getWeightGoalLabel(value: string): string {
    return this.weightGoalOptions.find(opt => opt.value === value)?.label || value;
  }

  getGenderLabel(value: string): string {
    return this.genderOptions.find(opt => opt.value === value)?.label || value;
  }

  calculateAge(dateOfBirth: string): number {
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
