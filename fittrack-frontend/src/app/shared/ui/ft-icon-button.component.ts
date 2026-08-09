import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'button[ft-icon-button]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[class]': `"ft-iconbtn" + (danger() ? " danger" : "")`,
    '[attr.aria-label]': `label()`,
  },
  styles: [
    `
      :host {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--muted);
        cursor: pointer;
        transition: color 0.12s ease, border-color 0.12s ease, background 0.12s ease;
      }
      :host:hover {
        color: var(--accent);
        border-color: var(--accent);
      }
      :host.danger:hover {
        color: var(--danger);
        border-color: var(--danger);
      }
    `,
  ],
})
export class FtIconButtonComponent {
  readonly label = input.required<string>();
  readonly danger = input<boolean>(false);
}
