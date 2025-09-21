import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Address } from '../../shared/models/address.model';

@Component({
  selector: 'app-add-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Address</h2>
    <mat-dialog-content>
      <form [formGroup]="addressForm">
        <mat-form-field appearance="outline">
          <mat-label>Street</mat-label>
          <input matInput formControlName="street" required>
          <mat-error *ngIf="addressForm.get('street')?.hasError('required')">Street is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <input matInput formControlName="city" required>
          <mat-error *ngIf="addressForm.get('city')?.hasError('required')">City is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>State</mat-label>
          <input matInput formControlName="state" required>
          <mat-error *ngIf="addressForm.get('state')?.hasError('required')">State is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Zip Code</mat-label>
          <input matInput formControlName="zipCode" required>
          <mat-error *ngIf="addressForm.get('zipCode')?.hasError('required')">Zip Code is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Address Type</mat-label>
          <mat-select formControlName="type" required>
            <mat-option value="HOME">Home</mat-option>
            <mat-option value="WORK">Work</mat-option>
            <mat-option value="OTHER">Other</mat-option>
          </mat-select>
          <mat-error *ngIf="addressForm.get('type')?.hasError('required')">Address Type is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="addressForm.invalid">Add Address</button>
    </mat-dialog-actions>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
  `]
})
export class AddAddressDialogComponent implements OnInit {
  addressForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddAddressDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Address | null
  ) { }

  ngOnInit(): void {
    this.addressForm = this.fb.group({
      street: [this.data?.street || '', Validators.required],
      city: [this.data?.city || '', Validators.required],
      state: [this.data?.state || '', Validators.required],
      zipCode: [this.data?.zipCode || '', Validators.required],
      type: [this.data?.type || '', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.addressForm.valid) {
      this.dialogRef.close(this.addressForm.value);
    }
  }
}
