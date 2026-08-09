import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FtButtonComponent, FtFormFieldComponent, FtIconComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./auth-card.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  readonly emailErrorText = $localize`:@@auth.register.emailInvalid:Enter a valid email address.`;
  readonly passwordHintText = $localize`:@@auth.register.passwordHint:Min 8 characters, 1 uppercase letter, 1 digit.`;
  readonly passwordErrorText = $localize`:@@auth.register.passwordInvalid:Password must have 8+ characters, one uppercase letter, and one digit.`;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)],
      ],
    });
  }

  showEmailError(): boolean {
    const c = this.registerForm.get('email');
    return !!(c && c.invalid && c.touched);
  }

  showPasswordError(): boolean {
    const c = this.registerForm.get('password');
    return !!(c && c.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          $localize`:@@auth.register.errorFallback:Registration failed. Please try again.`;
        console.error('Registration error:', err);
      },
    });
  }
}
