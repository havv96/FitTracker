import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _active = signal<PendingConfirm | null>(null);
  readonly active = this._active.asReadonly();

  confirm(request: ConfirmRequest): Promise<boolean> {
    return new Promise(resolve => {
      this._active.set({ ...request, resolve });
    });
  }

  respond(result: boolean): void {
    const pending = this._active();
    if (pending) {
      pending.resolve(result);
      this._active.set(null);
    }
  }
}
