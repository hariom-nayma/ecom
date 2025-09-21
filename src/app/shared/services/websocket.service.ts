import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface NotificationPayload {
  type: string;
  orderId?: number;
  status?: string;
  timestamp?: string;
  message?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient!: Client;
  private notificationsSubject = new Subject<NotificationPayload>();

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.stompClient && this.stompClient.active) return;

    const token = this.authService.getToken();
    if (!token) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (msg) => console.log('[STOMP]', msg),
    });

    this.stompClient.onConnect = () => {
      console.log('✅ WebSocket connected');

      this.stompClient.subscribe('/user/queue/notifications', (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          console.log('📩 User Notification:', payload);
          this.notificationsSubject.next(payload);
        } catch (e) {
          console.log('📩 Raw Notification:', message.body);
          this.notificationsSubject.next({ type: 'RAW', message: message.body });
        }
      });

      this.stompClient.subscribe('/topic/admin-notifications', (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          console.log('📩 Admin Notification:', payload);
          this.notificationsSubject.next(payload);
        } catch (e) {
          console.log('📩 Raw Notification:', message.body);
          this.notificationsSubject.next({ type: 'RAW', message: message.body });
        }
      });
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient?.active) this.stompClient.deactivate();
  }

  getNotificationObservable(): Observable<NotificationPayload> {
    return this.notificationsSubject.asObservable();
  }
}
