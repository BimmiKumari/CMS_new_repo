import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="avatar-container" [style.width.px]="size" [style.height.px]="size">
      <div class="avatar-wrapper" [class.has-photo]="hasProfilePhoto()" [class.clickable]="showUploadOverlay">
        <img [src]="getAvatarUrl()" 
             [alt]="name + ' Avatar'" 
             class="avatar-image"
             [style.width.px]="size" 
             [style.height.px]="size">
        
        <div *ngIf="!hasProfilePhoto() && showUploadOverlay" 
             class="upload-overlay" 
             (click)="onUploadClick()"
             matTooltip="Upload Profile Photo">
          <mat-icon class="camera-icon">camera_alt</mat-icon>
          <span class="upload-text" *ngIf="size >= 80">Upload Photo</span>
        </div>
      </div>
      
      <button *ngIf="showEditButton && hasProfilePhoto()" 
              mat-mini-fab 
              color="primary" 
              class="edit-button" 
              (click)="onUploadClick()"
              matTooltip="Change Photo">
        <mat-icon>camera_alt</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .avatar-container {
      position: relative;
      display: inline-block;
    }
    
    .avatar-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .avatar-wrapper.clickable {
      cursor: pointer;
    }
    
    .avatar-image {
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
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
      cursor: pointer;
    }
    
    .avatar-wrapper:hover .upload-overlay {
      opacity: 1;
    }
    
    .camera-icon {
      font-size: 24px;
      margin-bottom: 2px;
    }
    
    .upload-text {
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    .edit-button {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 32px;
      height: 32px;
      min-height: 32px;
    }
    
    /* Size variations */
    .avatar-container[style*="width: 36px"] .camera-icon {
      font-size: 16px;
    }
    
    .avatar-container[style*="width: 48px"] .camera-icon {
      font-size: 18px;
    }
    
    .avatar-container[style*="width: 120px"] .camera-icon {
      font-size: 28px;
    }
    
    .avatar-container[style*="width: 120px"] .edit-button {
      width: 40px;
      height: 40px;
      min-height: 40px;
    }
  `]
})
export class UserAvatarComponent {
  @Input() profilePictureURL: string = '';
  @Input() name: string = 'User';
  @Input() size: number = 36;
  @Input() showUploadOverlay: boolean = false;
  @Input() showEditButton: boolean = false;
  @Output() uploadClick = new EventEmitter<void>();

  hasProfilePhoto(): boolean {
    return !!(this.profilePictureURL && 
              this.profilePictureURL.trim() !== '' && 
              !this.profilePictureURL.includes('dicebear.com'));
  }

  getAvatarUrl(): string {
    if (this.hasProfilePhoto()) {
      return this.profilePictureURL;
    }
    return this.getDefaultAvatar();
  }

  getDefaultAvatar(): string {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  onUploadClick(): void {
    this.uploadClick.emit();
  }
}