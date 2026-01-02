import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="forgot-container">
      <div class="form-container">
        <div class="form-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset code</p>
        </div>
        
        <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="forgot-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" required>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="forgotForm.get('email')?.hasError('email') || forgotForm.get('email')?.hasError('pattern')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="forgotForm.invalid || (loading$ | async)" class="submit-btn">
            <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
            <span *ngIf="!(loading$ | async)">Send Reset Code</span>
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/auth/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .forgot-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .form-container {
      width: 100%;
      max-width: 450px;
    }
    
    .form-header {
      text-align: center;
      margin-bottom: 2rem;
      color: white;
    }
    
    .form-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .form-header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .forgot-form {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
      background-color: #10b981 !important;
    }
    
    .submit-btn:hover {
      background-color: #059669 !important;
    }
    
    .error-message {
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .success-message {
      color: #10b981;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .auth-links {
      text-align: center;
    }
    
    .auth-links a {
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      opacity: 0.9;
    }
    
    .auth-links a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-focus-outline-color: #10b981;
      --mdc-outlined-text-field-hover-outline-color: #10b981;
    }
    
    ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
      background-color: transparent;
    }
    
    @media (max-width: 768px) {
      .forgot-container {
        padding: 1.5rem;
      }
      
      .form-header h1 {
        font-size: 2rem;
      }
      
      .form-header p {
        font-size: 1rem;
      }
      
      .forgot-form {
        padding: 1.5rem;
      }
    }
    
    @media (max-width: 480px) {
      .forgot-container {
        padding: 1rem;
      }
      
      .form-header h1 {
        font-size: 1.75rem;
      }
      
      .forgot-form {
        padding: 1.25rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .forgot-form {
        background: rgba(31, 41, 55, 0.95);
      }
    }
  `]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loading$ = this.authService.loading$;
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      
      this.authService.forgotPassword(this.forgotForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Reset code sent to your email!';
            setTimeout(() => {
              this.router.navigate(['/auth/reset-password'], { 
                queryParams: { email: this.forgotForm.value.email } 
              });
            }, 2000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to send reset code';
        }
      });
    }
  }
}