import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { titleKey: 'nav.dashboard' },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
        data: { titleKey: 'nav.profile' },
      },
      {
        path: 'workout/exercises',
        loadComponent: () =>
          import('./features/workout/exercise-list.component').then(
            (m) => m.ExerciseListComponent,
          ),
        data: { titleKey: 'nav.library' },
      },
      {
        path: 'workout/session',
        loadComponent: () =>
          import('./features/workout/workout-session.component').then(
            (m) => m.WorkoutSessionComponent,
          ),
        data: { titleKey: 'nav.workout', badge: 'LIVE' },
      },
      {
        path: 'workout/history',
        loadComponent: () =>
          import('./features/workout/workout-history.component').then(
            (m) => m.WorkoutHistoryComponent,
          ),
        data: { titleKey: 'nav.history' },
      },
      {
        path: 'nutrition',
        loadComponent: () =>
          import('./features/nutrition/nutrition-log.component').then(
            (m) => m.NutritionLogComponent,
          ),
        data: { titleKey: 'nav.nutrition' },
      },
      {
        path: 'nutrition/search',
        loadComponent: () =>
          import('./features/nutrition/food-search.component').then((m) => m.FoodSearchComponent),
        data: { titleKey: 'nav.foodSearch' },
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/progress-dashboard.component').then(
            (m) => m.ProgressDashboardComponent,
          ),
        data: { titleKey: 'nav.progress' },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
