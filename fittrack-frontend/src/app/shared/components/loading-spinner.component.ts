import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-container" [class.fullscreen]="fullscreen">
      <div class="spinner"></div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .spinner-container.fullscreen {
      position: fixed;
      inset: 0;
      background: color-mix(in oklch, var(--bg) 90%, transparent);
      z-index: 60;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner-message {
      margin-top: 12px;
      color: var(--muted);
      font-family: var(--mono);
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() fullscreen: boolean = false;
}
