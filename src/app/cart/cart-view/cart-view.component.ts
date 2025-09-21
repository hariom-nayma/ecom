import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddressService } from '../../shared/services/address.service';
import { AuthService } from '../../auth/auth.service';
import { Address } from '../../shared/models/address.model';
import { AddAddressDialogComponent } from '../../user-address/add-address-dialog/add-address-dialog.component';
import { Product } from '../../shared/models/product.model';
import { OrderService } from '../../orders/order.service';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    MatRadioModule,
    MatDialogModule
  ],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.css']
})
export class CartViewComponent implements OnInit {
  cartItems: CartItem[] = [];
  displayedColumns: string[] = ['product', 'quantity', 'price', 'total', 'actions'];
  shippingAddress: string = '';
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  userId!: number;

  constructor(
    private cartService: CartService,
    private addressService: AddressService,
    private authService: AuthService,
    public dialog: MatDialog,
    private order: OrderService
  ) { }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    this.userId = this.authService.getUserId() || 0;
    if (this.userId) {
      this.loadAddresses();
    }
  }

  loadAddresses(): void {
    this.addressService.getAddresses(this.userId).subscribe(data => {
      this.addresses = data;
    });
  }

  openAddAddressDialog(): void {
    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '400px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newAddress: Address = result;
        this.addressService.addAddress(this.userId, newAddress).subscribe(data => {
          this.addresses.push(data);
          this.selectedAddressId = data.id || null; // Select the newly added address
        });
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.product.discountPrice * item.quantity), 0);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId.toString());
  }

  checkout(): void {
  if (!this.selectedAddressId) {
    console.log('❌ Please select an address.');
    return;
  }

  const orderRequest = {
    items: this.cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    })),
    shippingAddress: this.addresses.find(a => a.id === this.selectedAddressId)?.street + ', ' +
      this.addresses.find(a => a.id === this.selectedAddressId)?.city + ', ' +
      this.addresses.find(a => a.id === this.selectedAddressId)?.state + ' - ' +
      this.addresses.find(a => a.id === this.selectedAddressId)?.zipCode || ''
  };

  console.log('🛒 Sending order request:', orderRequest);

  this.cartService.clearCart(); // optional clear

  this.order.createOrder(orderRequest).subscribe({
    next: (order) => {
      console.log('✅ Order created:', order);
      // Optionally navigate to order details
      // this.router.navigate(['/orders', order.id]);
    },
    error: (err) => {
      console.error('❌ Failed to create order:', err);
    }
  });
}

}