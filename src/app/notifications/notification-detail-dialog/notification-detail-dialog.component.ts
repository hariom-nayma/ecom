import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notification } from '../../shared/models/notification.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-notification-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Notification Details</mat-card-title>
        <button mat-icon-button (click)="onClose()" style="margin-left: auto;">
          <mat-icon>close</mat-icon>
        </button>
      </mat-card-header>
      <mat-card-content>
        <p><strong>Type:</strong> {{ formatNotificationType(data.type) }}</p>
        <p><strong>Message:</strong> {{ data.message }}</p>
        <p><strong>Timestamp:</strong> {{ data.timestamp | date:'full' }}</p>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-raised-button color="primary" (click)="onClose()">Close</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card {
      padding: 20px;
      min-width: 300px;
      max-width: 500px;
    }
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    mat-card-title {
      font-size: 1.5em;
      font-weight: 500;
    }
    mat-card-content p {
      margin-bottom: 10px;
      font-size: 1.1em;
    }
  `]
})
export class NotificationDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NotificationDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Notification
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  formatNotificationType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}
