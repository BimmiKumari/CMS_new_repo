import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { UserAvatarComponent } from '../../../../shared/components/user-avatar.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    UserAvatarComponent
  ],
  template: `
    <mat-card class="profile-card">
      <mat-card-header>
        <mat-card-title>My Profile</mat-card-title>
        <mat-card-subtitle>Update your personal information</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Profile Photo Section -->
        <div class="photo-section">
          <app-user-avatar
            [profilePictureURL]="profilePhotoUrl || ''"
            [name]="profileForm.get('name')?.value || 'User'"
            [size]="120"
            [showUploadOverlay]="true"
            [showEditButton]="true"
            (uploadClick)="fileInput.click()">
          </app-user-avatar>
          <input #fileInput type="file" accept="image/*" (change)="onPhotoSelected($event)" style="display: none;">
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name">
            <mat-error *ngIf="profileForm.get('name')?.invalid">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" readonly>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput formControlName="phoneNumber">
            <mat-error *ngIf="profileForm.get('phoneNumber')?.invalid">Phone number is required</mat-error>
          </mat-form-field>

          <div class="actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || loading">
              {{ loading ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .profile-card {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .photo-section {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }
  `]
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  profilePhotoUrl: string | undefined;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // First try to load from backend API
    this.authService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          const profile = response.data;
          this.profileForm.patchValue({
            name: profile.name,
            email: profile.email,
            phoneNumber: profile.phoneNumber
          });
          this.profilePhotoUrl = profile.profilePictureURL;
          console.log('Loaded profile from API:', profile);
        }
      },
      error: (error) => {
        console.error('Error loading profile from API:', error);
        // Fallback to localStorage
        const user = this.authService.getCurrentUser();
        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber
          });
          this.profilePhotoUrl = user.profilePictureURL;
          console.log('Loaded profile from localStorage:', user);
        }
      }
    });
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePhotoUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      this.uploadPhoto();
    }
  }

  uploadPhoto(): void {
    if (!this.selectedFile) return;
    
    console.log('Uploading file:', this.selectedFile.name, 'Size:', this.selectedFile.size);
    
    const formData = new FormData();
    formData.append('photo', this.selectedFile);
    
    // Log FormData contents
    (formData as any).forEach((value: any, key: string) => {
      console.log('FormData:', key, value);
    });
    
    this.authService.updateProfilePhoto(formData).subscribe({
      next: (response) => {
        console.log('Upload success:', response);
        if (response.success) {
          this.profilePhotoUrl = response.data?.url || this.profilePhotoUrl;
          // update stored currentUser so other UI (navbar/profile) reflects change immediately
          try {
            const cur = this.authService.getCurrentUser();
            const updated = { ...cur, profilePictureURL: this.profilePhotoUrl };
            (this.authService as any).setCurrentUser(updated);
          } catch { /* noop */ }
          this.snackBar.open('Photo updated successfully!', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.snackBar.open(`Failed to update photo: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
      }
    });
  }

  hasProfilePhoto(): boolean {
    return !!(this.profilePhotoUrl && this.profilePhotoUrl.trim() !== '' && !this.profilePhotoUrl.includes('dicebear.com'));
  }

  getDefaultAvatar(): string {
    const user = this.authService.getCurrentUser();
    const name = user?.name || this.profileForm.get('name')?.value || 'User';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const formData = this.profileForm.value;
      
      this.authService.updateProfile(formData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          }
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
        }
      });
    }
  }
}