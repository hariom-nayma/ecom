import { Routes } from '@angular/router';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductDetailComponent } from './products/product-detail/product-detail.component';
import { CartViewComponent } from './cart/cart-view/cart-view.component';
import { OrderListComponent } from './orders/order-list/order-list.component';
import { OrderDetailsComponent } from './orders/order-details/order-details.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { OtpVerifyComponent } from './auth/otp-verify/otp-verify.component';
import { OrderAdminComponent } from './admin/order-admin/order-admin.component';
import { UsersComponent } from './admin/users/users.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { ProductAdminComponent } from './admin/product-admin/product-admin.component';
import { UserNotificationsComponent } from './notifications/user-notifications/user-notifications.component';
import { AdminNotificationsComponent } from './notifications/admin-notifications/admin-notifications.component';
import { UserAddressComponent } from './user-address/user-address.component';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'cart', component: CartViewComponent, canActivate: [AuthGuard] },
    { path: 'orders', component: OrderListComponent, canActivate: [AuthGuard] },
    { path: 'orders/:id', component: OrderDetailsComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'verify-otp', component: OtpVerifyComponent },
    { path: 'notifications', component: UserNotificationsComponent, canActivate: [AuthGuard] },
    { path: 'addresses', component: UserAddressComponent, canActivate: [AuthGuard] },
    {
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard],
        component:AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'products', component: ProductAdminComponent },
            { path: 'orders', component: OrderAdminComponent },
            { path: 'users', component: UsersComponent },
            { path: 'notifications', component: AdminNotificationsComponent }
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full'}
];