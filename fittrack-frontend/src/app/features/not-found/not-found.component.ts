import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FtButtonComponent } from '../../shared/ui/ft-button.component';
import { FtIconComponent } from '../../shared/ui/ft-icon.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, FtButtonComponent, FtIconComponent],
  template: `
    <div class="notfound">
      <div class="glyph mono">404</div>
      <div class="title" i18n="@@notFound.title">Page not found</div>
      <p class="message" i18n="@@notFound.message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a ft-button variant="primary" routerLink="/dashboard">
        <ft-icon name="arrow-left" [size]="14" />
        <span i18n="@@notFound.cta">Back to dashboard</span>
      </a>
    </div>
  `,
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent {}
