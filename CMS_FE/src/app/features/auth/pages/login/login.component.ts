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
import { RoleType } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
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
    <div class="login-container">
      <!-- Left Side - Green Background with SVG -->
      <div class="left-panel">
        <div class="svg-container">
          <svg viewBox="0 0 560 380" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Shadow filter -->
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
              </filter>
            </defs>

            <!-- ===== Central Doctor ===== -->
            <g filter="url(#shadow)">
              <circle cx="280" cy="75" r="30" fill="#FFD6B0"/>
              <!-- Face -->
              <circle cx="270" cy="72" r="3" fill="#5D4037"/>
              <circle cx="290" cy="72" r="3" fill="#5D4037"/>
              <path d="M270 85 Q280 90 290 85" stroke="#5D4037" stroke-width="2" fill="none"/>
              <rect x="240" y="110" width="80" height="120" rx="24" fill="#00BFA6"/>
              <path d="M240 110 L280 235 L320 110 Z" fill="#F4FFFC"/>
              <!-- Stethoscope -->
              <path d="M260 145 C235 175, 235 210, 270 222" stroke="#00695C" stroke-width="3.5" fill="none"/>
              <path d="M300 145 C325 175, 325 210, 290 222" stroke="#00695C" stroke-width="3.5" fill="none"/>
              <circle cx="280" cy="228" r="5" fill="#00695C"/>
            </g>

            <!-- ===== Nurse (Left) ===== -->
            <g filter="url(#shadow)">
              <circle cx="185" cy="95" r="26" fill="#FFE0C2"/>
              <!-- Face -->
              <circle cx="176" cy="93" r="3" fill="#5D4037"/>
              <circle cx="194" cy="93" r="3" fill="#5D4037"/>
              <path d="M176 105 Q185 110 194 105" stroke="#5D4037" stroke-width="2" fill="none"/>
              <rect x="155" y="122" width="60" height="95" rx="20" fill="#42A5F5"/>
              <rect x="175" y="145" width="20" height="48" rx="5" fill="#E3F2FD"/>
            </g>

            <!-- ===== Medical Staff (Right) ===== -->
            <g filter="url(#shadow)">
              <circle cx="375" cy="95" r="26" fill="#FFD8B8"/>
              <!-- Face -->
              <circle cx="366" cy="93" r="3" fill="#5D4037"/>
              <circle cx="384" cy="93" r="3" fill="#5D4037"/>
              <path d="M366 105 Q375 110 384 105" stroke="#5D4037" stroke-width="2" fill="none"/>
              <rect x="345" y="122" width="60" height="95" rx="20" fill="#66BB6A"/>
              <rect x="365" y="145" width="20" height="48" rx="5" fill="#E8F5E9"/>
            </g>

            <!-- ===== Medical Cross ===== -->
            <g filter="url(#shadow)">
              <rect x="255" y="18" width="50" height="50" rx="14" fill="#00C9A7"/>
              <rect x="277" y="26" width="6" height="34" fill="#FFFFFF"/>
              <rect x="263" y="40" width="34" height="6" fill="#FFFFFF"/>
            </g>

            <!-- ===== Heartbeat Line ===== -->
            <polyline
              points="85,280 135,280 155,250 175,310 195,280 255,280"
              stroke="#00897B"
              stroke-width="3.5"
              fill="none"
            />

            <!-- ===== Decorative Bright Dots ===== -->
            <circle cx="430" cy="70" r="6" fill="#00C9A7"/>
            <circle cx="455" cy="95" r="5" fill="#80DEEA"/>
            <circle cx="115" cy="80" r="5" fill="#4DB6AC"/>
          </svg>
        </div>
        <div class="welcome-text">
          <h2>Welcome Back</h2>
          <p>Sign in to access your MediCare CMS dashboard</p>
        </div>
      </div>

      <!-- Right Side - Login Form -->
      <div class="right-panel">
        <div class="form-container">
          <div class="back-arrow">
            <button (click)="goToHome()" class="back-btn">
              <i class="fas fa-arrow-left"></i>
            </button>
          </div>
          <div class="form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email') || loginForm.get('email')?.hasError('pattern')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="loginForm.invalid || (loading$ | async)" class="submit-btn">
              <mat-spinner diameter="20" *ngIf="loading$ | async"></mat-spinner>
              <span *ngIf="!(loading$ | async)">Sign In</span>
            </button>
          </form>

          <div class="auth-links">
            <a routerLink="/auth/forgot-password">Forgot Password?</a>
            <p>Don't have an account? <a routerLink="/auth/signup">Sign Up</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      position: relative;
    }

    .svg-container {
      margin-bottom: 0.2rem;
    }

    .svg-container svg {
      width: 500px;
      height: 380px;
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
    }

    .form-container {
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .back-arrow {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
    }

    .back-btn {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      background: #10b981;
      border-color: #10b981;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
    }

    .back-btn:hover i {
      color: white;
    }

    .back-btn i {
      color: #10b981;
      font-size: 1rem;
      transition: color 0.3s ease;
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

    .login-form {
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

    .auth-links {
      text-align: center;
    }

    .auth-links a {
      color: #10b981;
      text-decoration: none;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .auth-links a:hover {
      color: #059669;
      text-decoration: underline;
    }

    .auth-links p {
      color: #6b7280;
      margin: 0;
    }

    .auth-links p a {
      display: inline;
      margin: 0;
    }

    @media (max-width: 768px) {
      .login-container {
        flex-direction: column;
      }

      .left-panel {
        min-height: 40vh;
        padding: 1.5rem;
      }

      .svg-container svg {
        width: 400px;
        height: 300px;
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
        width: 320px;
        height: 240px;
      }

      .welcome-text h2 {
        font-size: 1.5rem;
      }

      .right-panel {
        padding: 1rem;
      }
    }

    @media (prefers-color-scheme: dark) {
      .form-container {
        background: rgba(31, 41, 55, 0.95);
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  errorDetails: any = null;
  loading$;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loading$ = this.authService.loading$;
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            this.redirectToDashboard(response.data.user.role);
          } else {
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: (error) => {
          // ApiService now throws normalized error objects { status, message, error }
          this.errorDetails = error;
          this.errorMessage = error?.message || 'Login failed. Please check your credentials.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private redirectToDashboard(role: RoleType): void {
    switch (role) {
      case RoleType.Admin:
        this.router.navigate(['/admin']);
        break;
      case RoleType.Doctor:
        this.router.navigate(['/doctor']);
        break;
      case RoleType.Staff:
        this.router.navigate(['/staff']);
        break;
      default:
        this.router.navigate(['/patient']);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}