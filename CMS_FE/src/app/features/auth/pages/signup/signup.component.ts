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
  selector: 'app-signup',
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
    <div class="signup-container">
      <!-- Left Side - Green Background with SVG -->
      <div class="left-panel">
        <div class="svg-container">
          <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <!-- Doctor Head -->
            <circle cx="200" cy="85" r="42" fill="#ffffff" stroke="#10b981" stroke-width="3"/>
            <!-- Doctor Body -->
            <rect x="135" y="130" width="130" height="150" rx="25" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
            <!-- Doctor Coat -->
            <path d="M135 130 L200 280 L265 130 Z" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
            <!-- Shirt -->
            <rect x="185" y="160" width="30" height="80" rx="6" fill="#10b981"/>
            <!-- Stethoscope -->
            <path d="M160 170 C130 210, 130 250, 190 265" stroke="#ffffff" stroke-width="5" fill="none"/>
            <path d="M240 170 C270 210, 270 250, 210 265" stroke="#ffffff" stroke-width="5" fill="none"/>
            <circle cx="200" cy="270" r="8" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
            <!-- Clipboard -->
            <rect x="60" y="170" width="60" height="80" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
            <rect x="75" y="155" width="30" height="20" rx="6" fill="#10b981"/>
            <line x1="75" y1="195" x2="105" y2="195" stroke="#10b981" stroke-width="3"/>
            <line x1="75" y1="215" x2="105" y2="215" stroke="#10b981" stroke-width="3"/>
            <!-- Heartbeat Monitor -->
            <rect x="280" y="170" width="70" height="50" rx="10" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
            <polyline points="290,200 305,200 315,185 325,215 335,200 350,200" stroke="#10b981" stroke-width="4" fill="none"/>
            <!-- Medical Cross -->
            <rect x="295" y="80" width="50" height="50" rx="12" fill="#ffffff" stroke="#10b981" stroke-width="3"/>
            <rect x="317" y="90" width="10" height="30" fill="#10b981"/>
            <rect x="305" y="102" width="35" height="10" fill="#10b981"/>
            <!-- Syringe -->
            <rect x="85" y="95" width="40" height="8" rx="4" fill="#ffffff" stroke="#10b981" stroke-width="2"/>
            <rect x="95" y="85" width="20" height="10" rx="3" fill="#10b981"/>
            <line x1="105" y1="103" x2="105" y2="125" stroke="#ffffff" stroke-width="4"/>
          </svg>
        </div>
        <div class="welcome-text">
          <h2>Join MediCare CMS</h2>
          <p>Create your account to access our comprehensive clinic management system</p>
        </div>
      </div>

      <!-- Right Side - Signup Form -->
      <div class="right-panel">
        <div class="form-container">
          <div class="form-header">
            <h1>Create Account</h1>
            <p>Fill in your details to get started</p>
          </div>
          
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="signup-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="signupForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('name')?.hasError('minlength')">
                Name must be at least 2 characters
              </mat-error>
              <mat-error *ngIf="signupForm.get('name')?.hasError('pattern')">
                Name can only contain letters and spaces
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="signupForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="+1234567890" required>
              <mat-error *ngIf="signupForm.get('phoneNumber')?.hasError('required')">
                Phone number is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('phoneNumber')?.hasError('pattern')">
                Please enter a valid phone number
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="signupForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('minlength')">
                Password must be at least 8 characters
              </mat-error>
              <mat-error *ngIf="signupForm.get('password')?.hasError('pattern')">
                Password must contain uppercase, lowercase, and number
              </mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <div class="success-message" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="signupForm.invalid || (loading$ | async)" class="submit-btn">
              <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
              <span *ngIf="!(loading$ | async)">Create Account</span>
            </button>
          </form>

          <div class="auth-links">
            <p>Already have an account? <a routerLink="/auth/login">Sign In</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      min-height: 100vh;
    }

    .left-panel {
      flex: 1;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      position: relative;
    }

    .svg-container {
      margin-bottom: 2rem;
    }

    .svg-container svg {
      width: 300px;
      height: 300px;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
    }

    .welcome-text {
      text-align: center;
      color: white;
    }

    .welcome-text h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .welcome-text p {
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 400px;
      line-height: 1.6;
    }

    .right-panel {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      background: #ffffff;
    }

    .form-container {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-header h1 {
      color: #1f2937;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .form-header p {
      color: #6b7280;
      font-size: 1rem;
    }

    .signup-form {
      margin-bottom: 2rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1rem;
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

    .auth-links p {
      color: #6b7280;
      margin: 0;
    }

    .auth-links a {
      color: #10b981;
      text-decoration: none;
      font-weight: 600;
    }

    .auth-links a:hover {
      color: #059669;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .signup-container {
        flex-direction: column;
      }

      .left-panel {
        min-height: 40vh;
        padding: 1.5rem;
      }

      .svg-container svg {
        width: 200px;
        height: 200px;
      }

      .welcome-text h2 {
        font-size: 1.8rem;
      }

      .welcome-text p {
        font-size: 1rem;
      }

      .right-panel {
        padding: 1.5rem;
      }

      .form-header h1 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .left-panel {
        min-height: 35vh;
        padding: 1rem;
      }

      .svg-container svg {
        width: 150px;
        height: 150px;
      }

      .welcome-text h2 {
        font-size: 1.5rem;
      }

      .right-panel {
        padding: 1rem;
      }
    }

    @media (prefers-color-scheme: dark) {
      .right-panel {
        background: #1f2937;
      }

      .form-header h1 {
        color: #ffffff;
      }

      .form-header p {
        color: #d1d5db;
      }

      .auth-links p {
        color: #d1d5db;
      }
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  errorDetails: any = null;
  loading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loading$ = this.authService.loading$;
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[0-9]{10,15}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      
      this.authService.signUp(this.signupForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Account created! Please check your email for verification code.';
            setTimeout(() => {
              this.router.navigate(['/auth/verify-otp'], { 
                queryParams: { email: this.signupForm.value.email } 
              });
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Signup failed';
          }
        },
        error: (error) => {
          this.errorDetails = error;
          this.errorMessage = error?.message || 'Signup failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }
}