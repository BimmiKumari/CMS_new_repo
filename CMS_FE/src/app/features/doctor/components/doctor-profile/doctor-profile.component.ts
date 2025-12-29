import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { DoctorService } from '../../services/doctor.service';
import { SPECIALIZATIONS } from '../../../../shared/constants/specializations';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <mat-card class="profile-card">
      <mat-card-header>
        <mat-card-title>Doctor Profile Setup</mat-card-title>
        <mat-card-subtitle>Complete your professional details to start receiving appointments</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Profile Photo Section -->
        <div class="photo-section">
          <div class="photo-container">
            <div class="photo-wrapper" [class.has-photo]="hasProfilePhoto()">
              <img *ngIf="hasProfilePhoto()" 
                   [src]="profilePhotoUrl" 
                   alt="Profile Photo" 
                   class="profile-photo">
              <div *ngIf="!hasProfilePhoto()" class="avatar-placeholder" (click)="fileInput.click()">
                <img [src]="getDefaultAvatar()" alt="Avatar" class="profile-photo">
                <div class="upload-overlay">
                  <mat-icon class="camera-icon">camera_alt</mat-icon>
                  <span class="upload-text">Upload Photo</span>
                </div>
              </div>
            </div>
            <button mat-mini-fab color="primary" class="photo-edit-btn" (click)="fileInput.click()">
              <mat-icon>camera_alt</mat-icon>
            </button>
            <input #fileInput type="file" accept="image/*" (change)="onPhotoSelected($event)" style="display: none;">
          </div>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <mat-select formControlName="specialization">
                <mat-option *ngFor="let spec of specializations" [value]="spec">{{spec}}</mat-option>
              </mat-select>
              <mat-error *ngIf="profileForm.get('specialization')?.invalid">Specialization is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Qualification</mat-label>
              <input matInput formControlName="qualification" placeholder="e.g. MBBS, MD">
              <mat-error *ngIf="profileForm.get('qualification')?.invalid">Qualification is required</mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Years of Experience</mat-label>
              <input matInput type="number" formControlName="yearOfExperience">
              <mat-error *ngIf="profileForm.get('yearOfExperience')?.invalid">Valid experience is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Slot Duration (minutes)</mat-label>
              <mat-select formControlName="slotDuration">
                <mat-option [value]="15">15 mins</mat-option>
                <mat-option [value]="30">30 mins</mat-option>
                <mat-option [value]="45">45 mins</mat-option>
                <mat-option [value]="60">60 mins</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Working Days</mat-label>
            <mat-select formControlName="workingDays" multiple>
              <mat-option *ngFor="let day of days" [value]="day">{{day}}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" formControlName="startTime">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" formControlName="endTime">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Break Start Time (Optional)</mat-label>
              <input matInput type="time" formControlName="breakStartTime">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Break End Time (Optional)</mat-label>
              <input matInput type="time" formControlName="breakEndTime">
            </mat-form-field>
          </div>

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
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-top: 20px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .full-width {
      width: 100%;
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
    .photo-container {
      position: relative;
      display: inline-block;
    }
    .photo-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
    }
    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #10b981;
    }
    .avatar-placeholder {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(16, 185, 129, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 50%;
    }
    .avatar-placeholder:hover .upload-overlay {
      opacity: 1;
    }
    .camera-icon {
      font-size: 28px;
      margin-bottom: 4px;
    }
    .upload-text {
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.5px;
    }
    .photo-edit-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
    }
    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DoctorProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  specializations = SPECIALIZATIONS;
  profilePhotoUrl: string | undefined;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      specialization: ['', Validators.required],
      qualification: ['', Validators.required],
      yearOfExperience: [0, [Validators.required, Validators.min(0)]],
      workingDays: [[], Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['17:00', Validators.required],
      slotDuration: [30, Validators.required],
      breakStartTime: [''],
      breakEndTime: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadUserPhoto();
  }

  loadUserPhoto(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profilePhotoUrl = user.profilePictureURL;
    }
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
    
    const formData = new FormData();
    formData.append('photo', this.selectedFile);
    
    (formData as any).forEach((value: any, key: string) => console.log('FormData:', key, value));

    this.authService.updateProfilePhoto(formData).subscribe({
      next: (response) => {
        if (response.success) {
          // Update the local profile photo URL
          this.profilePhotoUrl = response.data?.url || response.data?.profilePictureURL;
          
          // Update current user in auth service so navbar reflects change immediately
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            const updatedUser = { ...currentUser, profilePictureURL: this.profilePhotoUrl };
            // Use the private setCurrentUser method to update both localStorage and BehaviorSubject
            (this.authService as any).setCurrentUser(updatedUser);
          }
          
          this.snackBar.open('Photo updated successfully!', 'Close', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Failed to update photo', 'Close', { duration: 3000 });
      }
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.doctorService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.profileForm.patchValue({
            specialization: data.specialization,
            qualification: data.qualification,
            yearOfExperience: data.yearOfExperience,
            workingDays: data.workingDays || [],
            startTime: this.formatTime(data.startTime),
            endTime: this.formatTime(data.endTime),
            slotDuration: data.slotDuration,
            breakStartTime: this.formatTime(data.breakStartTime),
            breakEndTime: this.formatTime(data.breakEndTime)
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private formatTime(time: any): string {
    if (!time) return '';
    // If it's a TimeSpan string from .NET (e.g. "09:00:00")
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    return '';
  }

  hasProfilePhoto(): boolean {
    return !!(this.profilePhotoUrl && this.profilePhotoUrl.trim() !== '' && !this.profilePhotoUrl.includes('dicebear.com'));
  }

  getDefaultAvatar(): string {
    const user = this.authService.getCurrentUser();
    const name = user?.name || 'Doctor';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const val = this.profileForm.value;

      // Ensure times are in "HH:mm:ss" format for .NET TimeSpan
      const payload = {
        ...val,
        startTime: val.startTime + ':00',
        endTime: val.endTime + ':00',
        breakStartTime: val.breakStartTime ? val.breakStartTime + ':00' : null,
        breakEndTime: val.breakEndTime ? val.breakEndTime + ':00' : null
      };

      this.doctorService.updateProfile(payload).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Failed to update profile', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
