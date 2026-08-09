import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout/exercises',
    loadComponent: () => import('./features/workout/exercise-list.component').then(m => m.ExerciseListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout/session',
    loadComponent: () => import('./features/workout/workout-session.component').then(m => m.WorkoutSessionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'workout/history',
    loadComponent: () => import('./features/workout/workout-history.component').then(m => m.WorkoutHistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nutrition',
    loadComponent: () => import('./features/nutrition/nutrition-log.component').then(m => m.NutritionLogComponent),
    canActivate: [authGuard]
  },
  {
    path: 'nutrition/search',
    loadComponent: () => import('./features/nutrition/food-search.component').then(m => m.FoodSearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/analytics/progress-dashboard.component').then(m => m.ProgressDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
