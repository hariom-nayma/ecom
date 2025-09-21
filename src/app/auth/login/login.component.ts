import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

loading = false;

onSubmit(): void {
  if (this.loginForm.valid) {
    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Login successful! Redirecting...', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Login error:', err);

        let message = 'Login failed. Please try again later.';

        switch (err.status) {
          case 401:
            if (err.error?.message) {
              message = err.error.message;
            } else if (typeof err.error === 'string') {
              message = err.error;
            } else {
              message = 'Invalid credentials. Please try again.';
            }

            if (message.toLowerCase().includes('blocked')) {
              this.snackBar.open(
                'You are blocked and cannot access. Please contact admin.',
                'Close',
                { duration: 5000, panelClass: ['snackbar-error'] }
              );
              return;
            }
            break;

          case 0:
            message = 'Could not connect to the server. Please check your internet connection.';
            break;
        }

        this.errorMessage = message; // Display on form if needed
        this.snackBar.open(message, 'Close', {
          duration: 4000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}

}