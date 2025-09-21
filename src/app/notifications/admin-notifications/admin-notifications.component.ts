import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notification } from '../../shared/models/notification.model';
import { NotificationService } from '../notification.service';
import { WebsocketService, NotificationPayload } from '../../shared/services/websocket.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.css']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {

  notifications: Notification[] = [];
  selectedNotification: Notification | null = null;
  private notificationSubscription!: Subscription;

  constructor(
    private notificationService: NotificationService,
    private websocketService: WebsocketService
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
    this.notificationService.getAdminNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  onNotificationClick(notification: Notification): void {
    this.selectedNotification = notification;
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.isRead = true;
      });
    }
  }

  closePopup(): void {
    this.selectedNotification = null;
  }
}