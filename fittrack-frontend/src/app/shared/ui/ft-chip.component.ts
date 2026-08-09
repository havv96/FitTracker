import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'button[ft-chip], ft-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[class]': `"ft-chip" + (active() ? " active" : "")`,
    '[attr.aria-pressed]': `active()`,
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        font-family: var(--mono);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--muted);
        background: var(--surface);
        border: 1px solid var(--border);
        cursor: pointer;
        transition: color 0.12s ease, background 0.12s ease, border-color 0.12s ease;
        white-space: nowrap;
      }
      :host:hover {
        color: var(--fg);
        border-color: var(--muted);
      }
      :host.active {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
    `,
  ],
})
export class FtChipComponent {
  readonly active = input<boolean>(false);
}
