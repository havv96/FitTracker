import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a routerLink="/dashboard" class="home-link">Go to dashboard</a>
    </div>
  `,
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {}
