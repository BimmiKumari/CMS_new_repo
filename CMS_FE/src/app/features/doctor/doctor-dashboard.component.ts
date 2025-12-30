import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { PatientQueueComponent } from './components/patient-queue/patient-queue.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar.component';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    RouterOutlet,
    DoctorProfileComponent,
    PatientQueueComponent,
    UserAvatarComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport mode="side" opened>
        <div class="sidebar-header">
          <mat-icon color="primary">medical_services</mat-icon>
          <span>Doctor Portal</span>
        </div>
        
        <mat-nav-list>
          <a mat-list-item (click)="setActiveSection('queue')" [class.active]="activeSection === 'queue'">
            <mat-icon matListItemIcon>groups</mat-icon>
            <span matListItemTitle>Patient Queue</span>
          </a>

          <a mat-list-item (click)="setActiveSection('profile')" [class.active]="activeSection === 'profile'">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>Doctor Profile</span>
          </a>
        </mat-nav-list>


      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="main-toolbar">
          <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Doctor Dashboard</span>
          <span class="spacer"></span>
          <div class="user-info">
            <app-user-avatar
              [profilePictureURL]="currentUser?.profilePictureURL || ''"
              [name]="currentUser?.name || 'Doctor'"
              [size]="36">
            </app-user-avatar>
            <span class="user-name">{{ currentUser?.name || 'Doctor' }}</span>
            <button mat-icon-button (click)="logout()" class="logout-btn" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>
        
        <div class="main-content">
          <div [ngSwitch]="activeSection">
            
            <!-- Patient Queue -->
            <div *ngSwitchCase="'queue'">
               <app-patient-queue></app-patient-queue>
            </div>

            <!-- Doctor Profile -->
            <div *ngSwitchCase="'profile'">
              <app-doctor-profile></app-doctor-profile>
            </div>

            <!-- Default Welcome -->
            <div *ngSwitchDefault>
              <div class="welcome-section">
                <h1>Welcome, Dr. {{ currentUser?.name }}</h1>
                <p>Manage your clinic operations efficiently from your personal dashboard.</p>
                
                <div class="quick-actions">
                  <mat-card class="action-card" (click)="setActiveSection('profile')">
                    <mat-icon color="primary">account_circle</mat-icon>
                    <h3>Doctor Profile</h3>
                    <p>Complete your professional information.</p>
                  </mat-card>
                  
                  <mat-card class="action-card" (click)="setActiveSection('queue')">
                    <mat-icon color="primary">groups</mat-icon>
                    <h3>Patient Queue</h3>
                    <p>Manage your patients for today.</p>
                  </mat-card>
                </div>
              </div>
            </div>

          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    .sidenav-container {
      height: 100vh;
      background-color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .sidenav {
      width: 280px;
      border-right: none;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    .sidebar-header {
      padding: 32px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 24px;
      letter-spacing: -0.025em;
    }
    
    .sidebar-header mat-icon {
      color: #10b981;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    mat-nav-list {
      padding: 0 16px;
    }
    
    .mat-mdc-list-item {
      border-radius: 12px;
      margin-bottom: 8px;
      height: 48px;
      transition: all 0.2s ease;
      color: #64748b;
      font-weight: 500;
    }
    
    .mat-mdc-list-item:hover {
      background: #f1f5f9;
      color: #10b981;
    }
    
    .mat-mdc-list-item.active {
      background: #f0fdf4;
      color: #10b981;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
    }
    
    .mat-mdc-list-item mat-icon {
      color: inherit;
      margin-right: 12px;
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .sidebar-footer {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 16px;
      background: #ffffff;
    }
    
    .logout-btn {
      width: 100%;
      text-align: left;
      color: #ef4444;
      display: flex;
      align-items: center;
      gap: 8px;
      height: 44px;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .logout-btn:hover {
      background: #fef2f2;
      color: #dc2626;
    }
    
    .main-content {
      padding: 0;
      max-width: none;
      margin: 0;
      height: calc(100vh - 70px);
      overflow-y: auto;
      background: #f8fafc;
    }
    
    .main-toolbar {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 10;
      height: 70px;
      padding: 0 2rem;
    }
    
    .menu-button {
      margin-right: 1rem;
      color: #10b981;
    }
    
    .menu-button mat-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .toolbar-title {
      font-weight: 700;
      font-size: 1.5rem;
      color: #1f2937;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .user-name {
      font-weight: 500;
      color: #1f2937;
      font-size: 0.95rem;
    }
    
    .user-info .logout-btn {
      color: #6b7280;
      transition: color 0.2s ease;
      width: auto;
      height: auto;
    }
    
    .user-info .logout-btn:hover {
      color: #ef4444;
      background: transparent;
    }
    
    .user-info .logout-btn mat-icon {
      font-size: 22px !important;
      width: 22px !important;
      height: 22px !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
      letter-spacing: -0.025em;
      padding: 24px 24px 0;
    }
    
    .info-card {
      margin: 0 24px;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: none;
      background: #ffffff;
    }
    
    .welcome-section {
      text-align: center;
      padding: 60px 24px;
    }
    
    .welcome-section h1 {
      font-size: 36px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
      letter-spacing: -0.025em;
    }
    
    .welcome-section p {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 0;
    }
    
    .quick-actions {
      margin-top: 48px;
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .action-card {
      width: 280px;
      padding: 32px 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border-color: #10b981;
    }
    
    .action-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #10b981;
    }
    
    .action-card h3 {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    
    .action-card p {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      .welcome-section h1 {
        font-size: 28px;
      }
      
      .quick-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .action-card {
        width: 100%;
        max-width: 320px;
      }
      
      .main-toolbar {
        padding: 0 1rem;
        height: 64px;
      }
      
      .toolbar-title {
        font-size: 1.2rem;
      }
      
      .user-name {
        display: none;
      }
      
      .main-content {
        height: calc(100vh - 64px);
      }
    }
  `]
})
export class DoctorDashboardComponent {
  activeSection = 'queue';
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  getUserAvatar(): string {
    const url = this.currentUser?.profilePictureURL;
    if (url && typeof url === 'string' && url.trim().length > 0) return url;
    const name = this.currentUser?.name || 'Doctor';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}