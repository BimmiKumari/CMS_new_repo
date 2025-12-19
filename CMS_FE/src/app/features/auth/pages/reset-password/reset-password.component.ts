import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
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
    <div class="reset-container">
      <div class="form-container">
        <div class="form-header">
          <h1>Set New Password</h1>
          <p>Enter the code sent to your email and your new password</p>
        </div>
        
        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="reset-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" readonly>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reset Code</mat-label>
            <input matInput type="text" formControlName="code" required placeholder="Enter OTP">
            <mat-error *ngIf="resetForm.get('code')?.hasError('required')">
              Reset code is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password</mat-label>
            <input matInput type="password" formControlName="newPassword" required>
            <mat-error *ngIf="resetForm.get('newPassword')?.hasError('required')">
              New password is required
            </mat-error>
            <mat-error *ngIf="resetForm.get('newPassword')?.hasError('minlength')">
              Password must be at least 6 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm Password</mat-label>
            <input matInput type="password" formControlName="confirmPassword" required>
            <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('required')">
              Please confirm your password
            </mat-error>
            <mat-error *ngIf="resetForm.hasError('mismatch')">
              Passwords do not match
            </mat-error>
          </mat-form-field>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="resetForm.invalid || (loading$ | async)" class="submit-btn">
            <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
            <span *ngIf="!(loading$ | async)">Reset Password</span>
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/auth/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reset-container {
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
    
    .reset-form {
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
    
    @media (max-width: 768px) {
      .reset-container {
        padding: 1.5rem;
      }
      
      .form-header h1 {
        font-size: 2rem;
      }
      
      .form-header p {
        font-size: 1rem;
      }
      
      .reset-form {
        padding: 1.5rem;
      }
    }
    
    @media (max-width: 480px) {
      .reset-container {
        padding: 1rem;
      }
      
      .form-header h1 {
        font-size: 1.75rem;
      }
      
      .reset-form {
        padding: 1.25rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .reset-form {
        background: rgba(31, 41, 55, 0.95);
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  loading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loading$ = this.authService.loading$;
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    const code = this.route.snapshot.queryParamMap.get('code');

    if (email) {
      this.resetForm.patchValue({ email });
    }

    if (code) {
      this.resetForm.patchValue({ code });
    }

    if (!email && !code) {
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      const { email, code, newPassword } = this.resetForm.value;

      this.authService.resetPassword({ email, code, newPassword }).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Password reset successfully! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to reset password';
        }
      });
    }
  }
}
