import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatListModule, MatDividerModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit {

  notifications: Notification[] = [];
  @Output() close = new EventEmitter<void>();

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.notificationService.decrementUnreadCount();
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.notificationService.setUnreadCount(0);
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ORDER_PLACED':
        return 'shopping_cart';
      case 'ORDER_STATUS_CHANGED':
        return 'local_shipping';
      case 'NEW_PRODUCT':
        return 'new_releases';
      default:
        return 'notifications';
    }
  }
}
