import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UserAvatarComponent } from './user-avatar.component';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    UserAvatarComponent
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Profile Setup</mat-card-title>
          <mat-card-subtitle>Update your profile information</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Profile Photo Section -->
          <div class="photo-section">
            <app-user-avatar
              [profilePictureURL]="profilePhotoUrl"
              [name]="profileForm.get('name')?.value || currentUser?.name || 'User'"
              [size]="120"
              [showUploadOverlay]="true"
              [showEditButton]="true"
              (uploadClick)="fileInput.click()">
            </app-user-avatar>
            <input #fileInput 
                   type="file" 
                   accept="image/*" 
                   (change)="onFileSelected($event)" 
                   style="display: none;">
          </div>

          <!-- Profile Form -->
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" required>
              <mat-error *ngIf="profileForm.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" required>
              <mat-error *ngIf="profileForm.get('phoneNumber')?.hasError('required')">
                Phone number is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput [value]="currentUser?.email" readonly>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button 
                      color="primary" 
                      type="submit" 
                      [disabled]="profileForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <span *ngIf="!loading">Update Profile</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-card {
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .photo-section {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .form-actions button {
      min-width: 150px;
      height: 48px;
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }
    }
  `]
})
export class ProfileSetupComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: any;
  profilePhotoUrl: string = '';
  loading = false;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required]],
      phoneNumber: [this.currentUser?.phoneNumber || '', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // Load from backend API to get latest data
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          const profile = response.data;
          this.profileForm.patchValue({
            name: profile.name,
            phoneNumber: profile.phoneNumber
          });
          this.profilePhotoUrl = profile.profilePictureURL || '';
          console.log('Loaded profile photo URL:', this.profilePhotoUrl);
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Fallback to localStorage data
        const user = this.authService.getCurrentUser();
        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            phoneNumber: user.phoneNumber
          });
          this.profilePhotoUrl = user.profilePictureURL || '';
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  uploadPhoto(file: File): void {
    this.uploading = true;
    console.log('Uploading file:', file.name, 'Size:', file.size);
    
    const formData = new FormData();
    formData.append('photo', file);
    
    // Log FormData contents
    (formData as any).forEach((value: any, key: string) => {
      console.log('FormData:', key, value);
    });
    
    this.authService.updateProfilePhoto(formData).subscribe({
      next: (response) => {
        console.log('Upload success:', response);
        if (response.success) {
          this.profilePhotoUrl = response.data?.url || this.profilePhotoUrl;
          // Update current user in auth service so navbar/profile reflect new photo
          const updatedUser = { ...this.currentUser, profilePictureURL: this.profilePhotoUrl };
          this.authService['setCurrentUser'] && this.authService['setCurrentUser'](updatedUser);
          this.snackBar.open('Profile photo updated successfully', 'Close', { duration: 3000 });
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
        this.snackBar.open(`Error uploading photo: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
        this.uploading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const profileData = this.profileForm.value;

      this.authService.updateProfile(profileData).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
            // Update current user in auth service
            const updatedUser = { ...this.currentUser, ...profileData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  hasProfilePhoto(): boolean {
    return !!(this.profilePhotoUrl && this.profilePhotoUrl.trim() !== '' && !this.profilePhotoUrl.includes('dicebear.com'));
  }

  getProfilePhotoUrl(): string {
    if (this.hasProfilePhoto()) {
      return this.profilePhotoUrl;
    }
    return this.getDefaultAvatar();
  }

  getDefaultAvatar(): string {
    const name = this.currentUser?.name || this.profileForm.get('name')?.value || 'User';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }
}