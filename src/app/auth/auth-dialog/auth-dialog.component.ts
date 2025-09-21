import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule, MatSnackBarModule],
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css']
})
export class AuthDialogComponent {
  isLoginView: boolean;
  authForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AuthDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isLoginView: boolean }
  ) {
    this.isLoginView = data.isLoginView;
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      username: ['']
    });
    if (!this.isLoginView) {
      this.authForm.get('username')?.setValidators([Validators.required]);
    }
  }

  toggleView(): void {
    this.isLoginView = !this.isLoginView;
    if (this.isLoginView) {
      this.authForm.get('username')?.clearValidators();
    } else {
      this.authForm.get('username')?.setValidators([Validators.required]);
    }
    this.authForm.get('username')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      return;
    }

    if (this.isLoginView) {
      this.authService.login(this.authForm.value).subscribe({
        next: () => {
          this.snackBar.open('Login successful! Redirecting...', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.dialogRef.close();
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = err.error.message || err.error.error ||'Login failed';

          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    } else {
      this.authService.register(this.authForm.value).subscribe({
        next: () => {
          this.dialogRef.close();
          this.router.navigate(['/verify-otp'], { queryParams: { email: this.authForm.value.email } });
        },
        error: (err) => {
          this.errorMessage = err.error.message || 'Registration failed';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }
}
