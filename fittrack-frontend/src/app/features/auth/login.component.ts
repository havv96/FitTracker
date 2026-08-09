import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtFormFieldComponent } from '../../shared/ui/ft-form-field.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FtButtonComponent, FtFormFieldComponent, FtIconComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./auth-card.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  readonly emailErrorText = $localize`:@@auth.login.emailInvalid:Enter a valid email address.`;
  readonly passwordErrorText = $localize`:@@auth.login.passwordRequired:Password is required.`;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  showEmailError(): boolean {
    const c = this.loginForm.get('email');
    return !!(c && c.invalid && c.touched);
  }

  showPasswordError(): boolean {
    const c = this.loginForm.get('password');
    return !!(c && c.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          $localize`:@@auth.login.errorFallback:Login failed. Please check your credentials.`;
        console.error('Login error:', err);
      },
    });
  }
}
