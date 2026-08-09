import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type FtButtonVariant = 'primary' | 'ghost' | 'danger' | 'success';
export type FtButtonSize = 'sm' | 'md';

@Component({
  selector: 'ft-button, button[ft-button], a[ft-button]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': `"ft-btn " + variant() + " size-" + size() + (block() ? " block" : "")`,
    '[attr.disabled]': `disabled() ? true : null`,
  },
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: var(--radius);
        font-family: var(--font);
        font-weight: 600;
        font-size: 13px;
        line-height: 1;
        border: 1px solid var(--border);
        background: var(--surface);
        color: var(--fg);
        cursor: pointer;
        transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease,
          transform 0.05s ease;
        text-decoration: none;
        white-space: nowrap;
        user-select: none;
      }
      :host:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
      :host:active {
        transform: translateY(1px);
      }
      :host.block {
        width: 100%;
      }
      :host.size-sm {
        padding: 5px 10px;
        font-size: 12px;
      }
      :host.primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
      :host.primary:hover {
        background: var(--accent-hi);
        border-color: var(--accent-hi);
        color: #fff;
      }
      :host.danger {
        color: var(--danger);
        border-color: var(--danger);
        background: transparent;
      }
      :host.danger:hover {
        background: var(--danger);
        color: #fff;
      }
      :host.success {
        color: var(--success);
        border-color: var(--success);
        background: transparent;
      }
      :host.ghost {
        background: transparent;
      }
      :host[disabled] {
        cursor: not-allowed;
        opacity: 0.55;
        pointer-events: none;
      }
    `,
  ],
})
export class FtButtonComponent {
  readonly variant = input<FtButtonVariant>('ghost');
  readonly size = input<FtButtonSize>('md');
  readonly block = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
