import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddAddressDialogComponent } from './add-address-dialog/add-address-dialog.component';
import { Address } from '../shared/models/address.model';
import { AddressService } from '../shared/services/address.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-user-address',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule
  ],
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.css']
})
export class UserAddressComponent implements OnInit {
  addresses: Address[] = [];
  userId!: number;

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || 0; // Assuming getCurrentUser returns user with id
    if (this.userId === 0) {
      this.snackBar.open('User not logged in', 'Close', { duration: 3000 });
      return;
    }

    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.getAddresses(this.userId).subscribe(
      (data: Address[]) => {
        this.addresses = data;
      },
      error => {
        console.error('Error loading addresses:', error);
        this.snackBar.open('Failed to load addresses', 'Close', { duration: 3000 });
      }
    );
  }

  openAddAddressDialog(): void {
    const dialogRef = this.dialog.open(AddAddressDialogComponent, {
      width: '400px',
      data: null // No data passed for adding a new address
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result contains the new address data from the dialog
        const newAddress: Address = result;
        this.addressService.addAddress(this.userId, newAddress).subscribe(
          (data: Address) => {
            this.addresses.push(data);
            this.snackBar.open('Address added successfully', 'Close', { duration: 3000 });
          },
          error => {
            console.error('Error adding address:', error);
            this.snackBar.open('Failed to add address', 'Close', { duration: 3000 });
          }
        );
      }
    });
  }

  deleteAddress(addressId: number | undefined): void {
    if (addressId === undefined) return;

    this.addressService.deleteAddress(this.userId, addressId).subscribe(
      () => {
        this.addresses = this.addresses.filter(addr => addr.id !== addressId);
        this.snackBar.open('Address deleted successfully', 'Close', { duration: 3000 });
      },
      error => {
        console.error('Error deleting address:', error);
        this.snackBar.open('Failed to delete address', 'Close', { duration: 3000 });
      }
    );
  }
}
