import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'accept-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="accept-container">
      <div class="form-container">
        <div class="form-header">
          <mat-icon class="header-icon">mail</mat-icon>
          <h1>Accept Invitation</h1>
          <p>Complete your account setup by creating a secure password</p>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="accept-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Create Password</mat-label>
            <input matInput [type]="showPassword ? 'text' : 'password'" formControlName="newPassword" placeholder="Enter a secure password">
            <button mat-icon-button matSuffix type="button" (click)="showPassword = !showPassword" aria-label="Toggle password visibility">
              <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('newPassword')?.hasError('required')">
              Password is required
            </mat-error>
            <mat-error *ngIf="form.get('newPassword')?.hasError('minlength')">
              Password must be at least 8 characters
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading || !token" class="submit-btn">
              <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
              <mat-icon *ngIf="!loading">check_circle</mat-icon>
              <span *ngIf="!loading">Accept Invitation</span>
              <span *ngIf="loading">Processing...</span>
            </button>
          </div>
          
          <div class="message-container">
            <div *ngIf="success" class="success-message">
              <mat-icon>check_circle</mat-icon>
              {{ success }}
            </div>
            <div *ngIf="error" class="error-message">
              <mat-icon>error</mat-icon>
              {{ error }}
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    
    mat-icon {
      font-family: 'Material Icons' !important;
      font-weight: normal;
      font-style: normal;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'liga';
    }
    
    .accept-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .form-container {
      width: 100%;
      max-width: 500px;
    }
    
    .form-header {
      text-align: center;
      margin-bottom: 2rem;
      color: white;
    }
    
    .header-icon {
      font-size: 3rem !important;
      width: 3rem !important;
      height: 3rem !important;
      margin-bottom: 1rem;
      opacity: 0.9;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .form-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .form-header p {
      font-size: 1.1rem;
      opacity: 0.9;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .accept-form {
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 16px;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    
    .submit-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 2rem;
      font-weight: 600;
      background-color: #10b981 !important;
      min-width: 200px;
      justify-content: center;
    }
    
    .submit-btn:hover {
      background-color: #059669 !important;
    }
    
    .submit-btn:disabled {
      background-color: #d1d5db !important;
      color: #9ca3af !important;
    }
    
    .message-container {
      margin-top: 1rem;
    }
    
    .success-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #10b981;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      justify-content: center;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #ef4444;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-weight: 500;
      justify-content: center;
    }
    
    ::ng-deep .mat-mdc-form-field {
      --mdc-outlined-text-field-focus-outline-color: #10b981;
      --mdc-outlined-text-field-hover-outline-color: #10b981;
    }
    
    @media (max-width: 768px) {
      .accept-container {
        padding: 1.5rem;
      }
      
      .form-header h1 {
        font-size: 2rem;
      }
      
      .form-header p {
        font-size: 1rem;
      }
      
      .accept-form {
        padding: 1.5rem;
      }
      
      .submit-btn {
        width: 100%;
      }
    }
    
    @media (max-width: 480px) {
      .accept-container {
        padding: 1rem;
      }
      
      .form-header h1 {
        font-size: 1.75rem;
      }
      
      .accept-form {
        padding: 1.25rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .accept-form {
        background: rgba(31, 41, 55, 0.95);
      }
      
      .success-message {
        background: #065f46;
        border-color: #10b981;
        color: #bbf7d0;
      }
      
      .error-message {
        background: #7f1d1d;
        border-color: #ef4444;
        color: #fecaca;
      }
    }
  `]
})
export class AcceptInvitationComponent {
  form: FormGroup;
  loading = false;
  success = '';
  error = '';
  showPassword = false;
  token: string | null = null;

  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({ newPassword: ['', [Validators.required, Validators.minLength(8)]] });
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token = token;
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    if (!this.token) { this.error = 'Missing invitation token'; return; }
    this.loading = true;
    const newPassword = String(this.form.get('newPassword')?.value ?? '');
    this.auth.acceptInvite({ token: this.token, newPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message || 'Invitation accepted';
        this.form.reset();
        // Redirect to login so user can authenticate
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to accept invitation';
      }
    });
  }
  
}
