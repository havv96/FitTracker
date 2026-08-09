import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  private dialogService = inject(ConfirmDialogService);
  readonly active = this.dialogService.active;

  confirm(): void {
    this.dialogService.respond(true);
  }

  cancel(): void {
    this.dialogService.respond(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.active()) this.cancel();
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: Event): void {
    if (this.active()) {
      event.preventDefault();
      this.confirm();
    }
  }
}
