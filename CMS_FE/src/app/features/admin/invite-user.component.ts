import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { RoleType } from '../../shared/models/auth.models';

@Component({
  selector: 'invite-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule, MatIconModule],
  template: `
    <div class="invite-form-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="invite-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" formControlName="email" required placeholder="user@example.com">
            <mat-error *ngIf="form.get('email')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email') || form.get('email')?.hasError('pattern')">
              Please enter a valid email address
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" required placeholder="John Doe">
            <mat-hint>Enter name as per Aadhaar card</mat-hint>
            <mat-error *ngIf="form.get('name')?.hasError('required')">
              Name is required
            </mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('minlength')">
              Name must be at least 2 characters
            </mat-error>
            <mat-error *ngIf="form.get('name')?.hasError('pattern')">
              Name can only contain letters and spaces
            </mat-error>
          </mat-form-field>
        </div>
        
        <div class="form-row">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber" required placeholder="1234567890" maxlength="10">
            <mat-error *ngIf="form.get('phoneNumber')?.hasError('required')">
              Phone number is required
            </mat-error>
            <mat-error *ngIf="form.get('phoneNumber')?.hasError('pattern')">
              Please enter a valid 10-digit phone number
            </mat-error>
            <mat-error *ngIf="form.get('phoneNumber')?.hasError('minlength') || form.get('phoneNumber')?.hasError('maxlength')">
              Phone number must be exactly 10 digits
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role" required>
              <mat-option [value]="RoleType.Staff">Staff Member</mat-option>
              <mat-option [value]="RoleType.Doctor">Doctor</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('role')?.hasError('required')">
              Role is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading" class="submit-btn">
            <mat-icon *ngIf="loading">hourglass_empty</mat-icon>
            <span *ngIf="!loading">Send Invitation</span>
            <span *ngIf="loading">Sending...</span>
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
  `,
  styles: [`
    .invite-form-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .invite-form {
      padding: 3rem;
      color: #1f2937;
    }
    
    .form-row {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .form-field {
      flex: 1;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 3rem;
      margin-bottom: 2rem;
    }
    
    .submit-btn {
      padding: 1rem 3rem;
      font-weight: 600;
      font-size: 1.1rem;
      background-color: #10b981 !important;
      color: #ffffff !important;
      border: none;
      border-radius: 12px;
      min-width: 200px;
      height: 56px;
    }
    
    .submit-btn:hover {
      background-color: #059669 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .submit-btn:disabled {
      background-color: #d1d5db !important;
      color: #9ca3af !important;
      transform: none;
      box-shadow: none;
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
    }
    
    ::ng-deep .mat-mdc-form-field {
      margin-bottom: 0.5rem;
    }
    
    @media (max-width: 768px) {
      .invite-form {
        padding: 2rem;
      }
      
      .form-row {
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      .form-actions {
        margin-top: 2rem;
      }
      
      .submit-btn {
        width: 100%;
        min-width: unset;
      }
    }
    
    @media (max-width: 480px) {
      .invite-form {
        padding: 1.5rem;
      }
      
      .form-row {
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .invite-form {
        color: #ffffff;
      }
      
      .success-message {
        background: #065f46;
        border-color: #10b981;
        color: #6ee7b7;
      }
      
      .error-message {
        background: #7f1d1d;
        border-color: #ef4444;
        color: #fca5a5;
      }
      

    }
  `]
})
export class InviteUserComponent {
  RoleType = RoleType;
  form: any;
  loading = false;
  success = '';
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.minLength(10), Validators.maxLength(10)]],
      role: [RoleType.Staff, Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.success = '';
    this.error = '';
    const payload = {
      email: String(this.form.get('email')?.value ?? ''),
      name: String(this.form.get('name')?.value ?? ''),
      phoneNumber: String(this.form.get('phoneNumber')?.value ?? ''),
      role: this.form.get('role')?.value
    };

    this.auth.inviteUser(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = res.message || 'Invitation sent';
        this.form.reset({ role: RoleType.Staff });
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.message || 'Failed to invite';
      }
    });
  }
}
