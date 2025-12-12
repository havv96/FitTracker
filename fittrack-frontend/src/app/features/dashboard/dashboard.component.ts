import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutService } from '../../core/services/workout.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="dashboard-container">
      <!-- Header with Navigation -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>FitTrack Pro</h1>
        </div>
        <div class="nav-menu">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/workout/session" routerLinkActive="active">Workout</a>
          <a routerLink="/nutrition" routerLinkActive="active">Nutrition</a>
          <a routerLink="/analytics" routerLinkActive="active">Progress</a>
          <a routerLink="/profile" routerLinkActive="active">Profile</a>
        </div>
        <div class="nav-actions">
          <span class="user-email">{{ (currentUser | async)?.email }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="dashboard-content">
        <div class="welcome-section">
          <h2>Welcome back!</h2>
          <p>Ready to crush your fitness goals today?</p>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="action-card" routerLink="/workout/session">
            <div class="action-icon">🏋️</div>
            <h3>Start Workout</h3>
            <p>Begin tracking your workout session</p>
          </div>

          <div class="action-card" routerLink="/nutrition">
            <div class="action-icon">🍎</div>
            <h3>Track Nutrition</h3>
            <p>Log your meals and macros</p>
          </div>

          <div class="action-card" routerLink="/analytics">
            <div class="action-icon">📊</div>
            <h3>View Progress</h3>
            <p>Track your fitness journey</p>
          </div>

          <div class="action-card" routerLink="/profile">
            <div class="action-icon">👤</div>
            <h3>Profile</h3>
            <p>Manage your profile and goals</p>
          </div>
        </div>

        <!-- Active Workout Alert -->
        <div *ngIf="hasActiveWorkout()" class="active-workout-alert">
          <h3>⚡ You have an active workout!</h3>
          <p>Continue where you left off</p>
          <button routerLink="/workout/session" class="btn-primary">
            Resume Workout
          </button>
        </div>

        <!-- Coming Soon Features -->
        <div class="coming-soon">
          <h3>Coming Soon</h3>
          <div class="feature-list">
            <div class="feature-item">💧 Hydration Monitor</div>
            <div class="feature-item">😴 Sleep Tracking</div>
            <div class="feature-item">📈 Advanced Analytics</div>
            <div class="feature-item">🎯 Goal Setting & Reminders</div>
            <div class="feature-item">📱 Progressive Web App</div>
            <div class="feature-item">🏆 Achievements & Streaks</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f5f5f5;
    }

    .navbar {
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 15px 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
    }

    .nav-brand h1 {
      margin: 0;
      color: #4CAF50;
      font-size: 24px;
    }

    .nav-menu {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .nav-menu a {
      color: #666;
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.3s;
    }

    .nav-menu a:hover {
      background: #f0f0f0;
      color: #333;
    }

    .nav-menu a.active {
      background: #4CAF50;
      color: white;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-email {
      color: #666;
      font-size: 14px;
    }

    .btn-logout {
      background: #f44336;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.3s;
    }

    .btn-logout:hover {
      background: #d32f2f;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .welcome-section {
      text-align: center;
      margin-bottom: 50px;
    }

    .welcome-section h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 36px;
    }

    .welcome-section p {
      color: #666;
      font-size: 18px;
      margin: 0;
    }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .action-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .action-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    .action-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 20px;
    }

    .action-card p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .active-workout-alert {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 40px;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
    }

    .active-workout-alert h3 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }

    .active-workout-alert p {
      margin: 0 0 20px 0;
      font-size: 16px;
    }

    .btn-primary {
      background: white;
      color: #F57C00;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: transform 0.2s;
    }

    .btn-primary:hover {
      transform: scale(1.05);
    }

    .coming-soon {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .coming-soon h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 24px;
    }

    .feature-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .feature-item {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      color: #666;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        align-items: stretch;
      }

      .nav-menu {
        flex-direction: column;
        gap: 10px;
      }

      .nav-actions {
        justify-content: space-between;
      }
    }
  `]
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
