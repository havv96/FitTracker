import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private workoutService = inject(WorkoutService);
  private router = inject(Router);

  currentUser = this.authService.currentUser$;

  hasActiveWorkout(): boolean {
    return this.workoutService.hasActiveWorkout();
  }

  logout(): void {
    this.authService.logout();
  }
}
