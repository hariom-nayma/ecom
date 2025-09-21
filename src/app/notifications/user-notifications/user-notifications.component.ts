import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../notification.service';
import { WebsocketService, NotificationPayload } from '../../shared/services/websocket.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationDetailDialogComponent } from '../notification-detail-dialog/notification-detail-dialog.component';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-user-notifications',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatToolbarModule, MatDialogModule],
  templateUrl: './user-notifications.component.html',
  styleUrls: ['./user-notifications.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger('100ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class UserNotificationsComponent implements OnInit, OnDestroy {

  notifications: Notification[] = [];
  private notificationSubscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private websocketService: WebsocketService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
    this.websocketService.connect();
    this.notificationSubscription = this.websocketService.getNotificationObservable().subscribe(
      (payload: NotificationPayload) => {
        // Assuming the payload can be directly mapped or transformed to a Notification object
        const newNotification: Notification = {
          id: Date.now(), // Placeholder for a unique ID
          type: payload.type,
          message: payload.message || 'No message content',
          isRead: false,
          timestamp: payload.timestamp || new Date().toISOString()
        };
        this.notifications.unshift(newNotification);
        this.notificationService.incrementUnreadCount();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe(data => {
      this.notifications = data;
      const unreadCount = data.filter(n => !n.isRead).length;
      this.notificationService.setUnreadCount(unreadCount);
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
        this.notificationService.decrementUnreadCount();
      });
    }

    this.dialog.open(NotificationDetailDialogComponent, {
      data: notification,
      width: '400px'
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

  formatNotificationType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }
}