import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FtIconComponent, IconName } from './ft-icon.component';

@Component({
  selector: 'ft-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FtIconComponent],
  template: `
    @if (icon(); as i) {
      <div class="icon"><ft-icon [name]="i" [size]="20" /></div>
    }
    <div class="title">{{ title() }}</div>
    @if (message(); as m) {
      <p class="message">{{ m }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 32px 20px;
        text-align: center;
        color: var(--muted);
      }
      .icon {
        width: 40px;
        height: 40px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-dim);
        color: var(--accent);
        margin-bottom: 4px;
      }
      .title {
        font-weight: 700;
        font-size: 14px;
        color: var(--fg);
        letter-spacing: -0.01em;
      }
      .message {
        font-size: 13px;
        color: var(--muted);
        max-width: 32ch;
      }
      .actions:empty {
        display: none;
      }
      .actions {
        margin-top: 8px;
      }
    `,
  ],
})
export class FtEmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
  readonly icon = input<IconName | null>(null);
}
