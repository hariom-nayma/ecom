
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, map } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';
import { NotificationService } from '../../notifications/notification.service';
import { WebsocketService } from '../../shared/services/websocket.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthDialogComponent } from '../../auth/auth-dialog/auth-dialog.component';
// import { LoginDialogComponent } from '../../auth/login-dialog/login-dialog.component';
// import { RegisterDialogComponent } from '../../auth/register-dialog/register-dialog.component';

import { ConfirmationDialogComponent } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    MatBadgeModule,
    MatDialogModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn$!: Observable<boolean>;
  searchTerm: string = '';
  cartItemCount$!: Observable<number>;
  unreadNotificationCount$!: Observable<number>;
  private notificationSubscription!: Subscription;
  isAdmin$!: Observable<boolean>;
  showMobileSearch: boolean = false;
  user: any;




  constructor(
    private authService: AuthService, 
    private router: Router, 
    private cartService: CartService,
    private notificationService: NotificationService,
    private websocketService: WebsocketService,
    private dialog: MatDialog
  ) {}

  openLoginDialog(isLogin: boolean): void {
    this.dialog.open(AuthDialogComponent, {
      width: '800px',
      panelClass: 'auth-dialog-container',
      data: { isLoginView: isLogin }
    });
  }

  // openRegisterDialog(): void {
  //   this.dialog.open(RegisterDialogComponent, {
  //     width: '800px',
  //     panelClass: 'auth-dialog-container'
  //   });
  // }


  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
    });
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.userRole$.pipe(
      map(role => role === 'ADMIN')
    );
    this.cartItemCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0))
    );

    this.notificationService.getUnreadCount().subscribe(count => {
      this.notificationService.setUnreadCount(count);
    });

    this.unreadNotificationCount$ = this.notificationService.unreadCount$;

    this.websocketService.connect();
    this.notificationSubscription = this.websocketService.getNotificationObservable().subscribe(() => {
      this.notificationService.incrementUnreadCount();
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.websocketService.disconnect();
  }

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { message: 'Are you sure you want to logout?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.authService.logout();
        this.router.navigate(['/home']);
      }
    });
  }

  searchProducts(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchTerm } });
    }
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  toggleMobileSearch(): void {
    this.showMobileSearch = !this.showMobileSearch;
  }
}
