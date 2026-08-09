import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;
  private readonly defaultTtlMs = 4000;

  info(message: string, ttlMs = this.defaultTtlMs): void {
    this.push('info', message, ttlMs);
  }

  success(message: string, ttlMs = this.defaultTtlMs): void {
    this.push('success', message, ttlMs);
  }

  error(message: string, ttlMs = 6000): void {
    this.push('error', message, ttlMs);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(kind: ToastKind, message: string, ttlMs: number): void {
    const id = this.nextId++;
    this._toasts.update(list => [...list, { id, kind, message }]);
    if (ttlMs > 0) {
      setTimeout(() => this.dismiss(id), ttlMs);
    }
  }
}
