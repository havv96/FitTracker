import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FtTagTone = 'accent' | 'success' | 'warn' | 'danger' | 'muted';

@Component({
  selector: 'ft-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': `"ft-tag tone-" + tone()`,
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-family: var(--mono);
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        line-height: 1.4;
        background: var(--accent-dim);
        color: var(--accent);
      }
      :host.tone-success {
        background: var(--tag-s-bg);
        color: var(--success);
      }
      :host.tone-warn {
        background: var(--tag-w-bg);
        color: var(--warn);
      }
      :host.tone-danger {
        background: var(--tag-d-bg);
        color: var(--danger);
      }
      :host.tone-muted {
        background: var(--tag-m-bg);
        color: var(--muted);
      }
    `,
  ],
})
export class FtTagComponent {
  readonly tone = input<FtTagTone>('accent');
}
