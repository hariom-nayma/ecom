import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/navbar/navbar.component';
import { FooterComponent } from './core/footer/footer.component';
import { AuthService } from './auth/auth.service';
import { WebsocketService } from './shared/services/websocket.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, MatSnackBarModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ecom-frontend';

  private authSub?: Subscription;
  private notifSub?: Subscription;

  constructor(
    private authService: AuthService,
    private websocketService: WebsocketService,
    private snackBar: MatSnackBar
  ) {}

  // src/app/app.component.ts
ngOnInit(): void {
  this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
    if (isLoggedIn) {
      console.log('✅ User logged in → connecting WebSocket');

      // Connect only if not already active
      if (true) {
        this.websocketService.connect();
      }

      if (!this.notifSub) {
       this.notifSub = this.websocketService.getNotificationObservable().subscribe({
  next: (payload) => {
    console.log('📩 Notification:', payload);
    this.snackBar.open(
      `🔔 ${payload.type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}: ${payload['message'] || payload.status}`,
      'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      }
    );
  },
});

      }
    } else {
      console.log('🚪 User logged out → disconnecting WebSocket');
      this.websocketService.disconnect();
      this.notifSub?.unsubscribe();
      this.notifSub = undefined;
    }
  });
}



  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    this.websocketService.disconnect();
  }
}
