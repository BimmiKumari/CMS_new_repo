import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
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
    <div class="verify-container">
      <div class="form-container">
        <div class="form-header">
          <h1>Verify Email</h1>
          <p>Enter the verification code sent to {{ email }}</p>
        </div>
        
        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="verify-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Verification Code</mat-label>
            <input matInput formControlName="code" required maxlength="6" placeholder="Enter 6-digit code">
            <mat-error *ngIf="otpForm.get('code')?.hasError('required')">
              Verification code is required
            </mat-error>
          </mat-form-field>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button mat-raised-button color="primary" type="submit" 
                  [disabled]="otpForm.invalid || (loading$ | async)" class="submit-btn">
            <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
            <span *ngIf="!(loading$ | async)">Verify Email</span>
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/auth/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-container {
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
      word-break: break-word;
    }
    
    .verify-form {
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
      .verify-container {
        padding: 1.5rem;
      }
      
      .form-header h1 {
        font-size: 2rem;
      }
      
      .form-header p {
        font-size: 1rem;
      }
      
      .verify-form {
        padding: 1.5rem;
      }
    }
    
    @media (max-width: 480px) {
      .verify-container {
        padding: 1rem;
      }
      
      .form-header h1 {
        font-size: 1.75rem;
      }
      
      .verify-form {
        padding: 1.25rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .verify-form {
        background: rgba(31, 41, 55, 0.95);
      }
    }
  `]
})
export class VerifyOtpComponent implements OnInit {
  otpForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  email = '';
  loading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loading$ = this.authService.loading$;
    this.otpForm = this.fb.group({
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid && this.email) {
      this.errorMessage = '';
      this.successMessage = '';
      
      const otpData = {
        email: this.email,
        code: this.otpForm.value.code,
        purpose: 'signup'
      };

      this.authService.verifyOtp(otpData).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Email verified successfully!';
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Invalid verification code';
        }
      });
    }
  }
}