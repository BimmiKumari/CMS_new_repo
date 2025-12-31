import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
    selector: 'app-cancellation-snack',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    template: `
    <div class="snack-container">
      <div class="message-section">
        <span class="title">Cancel Appointment?</span>
        <span class="subtitle">80% of your payment (₹400) will be refunded.</span>
      </div>
      <div class="actions">
        <button mat-button class="cancel-btn" (click)="onDecline()">
          No, Keep it
        </button>
        <button mat-flat-button color="warn" class="confirm-btn" (click)="onConfirm()">
          Yes, Cancel
        </button>
      </div>
    </div>
  `,
    styles: [`
    .snack-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0;
    }
    .message-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .title {
      font-weight: 600;
      font-size: 16px;
    }
    .subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .cancel-btn {
      color: white !important;
    }
    .confirm-btn {
      background-color: #ef4444 !important;
      color: white !important;
    }
  `]
})
export class CancellationSnackBarComponent {
    constructor(
        public snackBarRef: MatSnackBarRef<CancellationSnackBarComponent>,
        @Inject(MAT_SNACK_BAR_DATA) public data: any
    ) { }

    onConfirm(): void {
        // Dismiss with action signals confirmation
        this.snackBarRef.dismissWithAction();
    }

    onDecline(): void {
        // Regular dismiss
        this.snackBarRef.dismiss();
    }
}
