import { Component, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SendNotificationComponent } from '../notifications/components/send-notification/send-notification.component';
import { PatientQueueComponent } from '../doctor/components/patient-queue/patient-queue.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatTooltipModule,
    RouterOutlet,
    SendNotificationComponent,
    PatientQueueComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" [mode]="isHandset ? 'over' : 'side'" [opened]="!isHandset" [fixedInViewport]="true">
        <mat-toolbar class="sidenav-toolbar">
          <mat-icon class="brand-icon">local_hospital</mat-icon>
          <span class="brand-text">Staff Portal</span>
        </mat-toolbar>
        <mat-nav-list class="nav-list">
          <a mat-list-item (click)="setActiveSection('appointments'); closeSidenavIfHandset()" [class.active]="activeSection === 'appointments'">
            <mat-icon matListItemIcon>event</mat-icon>
            <span matListItemTitle>Manage Appointments</span>
          </a>
          <a mat-list-item (click)="setActiveSection('patients'); closeSidenavIfHandset()" [class.active]="activeSection === 'patients'">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Patient Management</span>
          </a>
          <a mat-list-item (click)="setActiveSection('reminders'); closeSidenavIfHandset()" [class.active]="activeSection === 'reminders'">
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Reminder Management</span>
          </a>
          <a mat-list-item (click)="setActiveSection('billing'); closeSidenavIfHandset()" [class.active]="activeSection === 'billing'">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Billing</span>
          </a>
          <a mat-list-item (click)="setActiveSection('reports'); closeSidenavIfHandset()" [class.active]="activeSection === 'reports'">
            <mat-icon matListItemIcon>assessment</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="main-toolbar">
          <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Staff Dashboard</span>
          <span class="spacer"></span>
          <div class="user-info">
            <img [src]="getUserAvatar()" alt="User Avatar" class="user-avatar">
            <span class="user-name">{{ currentUser?.name || 'Staff' }}</span>
            <button mat-icon-button (click)="logout()" class="logout-btn" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <div class="content">
          <div [ngSwitch]="activeSection">
            <div *ngSwitchCase="'appointments'">
              <app-patient-queue></app-patient-queue>
            </div>

            <div *ngSwitchCase="'patients'">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Patient Management</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Register new patients and update patient information.</p>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngSwitchCase="'reminders'">
              <app-send-notification></app-send-notification>
            </div>

            <div *ngSwitchCase="'billing'">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Billing Management</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Process payments and manage billing records.</p>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngSwitchCase="'reports'">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Reports</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Generate and view various reports.</p>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngSwitchDefault>
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Staff Dashboard</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Welcome to the staff portal. Select an option from the sidebar.</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
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
    
    .sidenav-container {
      height: 100vh;
      background: #f8fafc;
    }
    
    .sidenav {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .sidenav-toolbar {
      background: #10b981;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1rem;
    }
    
    .brand-icon {
      font-size: 28px !important;
      width: 28px !important;
      height: 28px !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .brand-text {
      font-weight: 700;
    }
    
    .nav-list {
      padding-top: 1rem;
    }
    
    .nav-list mat-list-item {
      margin: 0;
      transition: all 0.3s ease;
      cursor: pointer;
      min-height: 48px;
    }
    
    .nav-list mat-list-item:hover {
      background: #f0fdf4;
    }
    
    .nav-list mat-list-item.active {
      background: #10b981;
      color: white;
    }
    
    .nav-list mat-list-item.active mat-icon {
      color: white;
    }
    
    .nav-list mat-list-item mat-icon {
      color: #6b7280;
      margin-right: 0.75rem;
      font-size: 24px;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .nav-list mat-list-item:hover mat-icon {
      color: #10b981;
    }
    
    .nav-list mat-list-item.active:hover mat-icon {
      color: white;
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
    
    .logout-btn {
      color: #6b7280;
      transition: color 0.2s ease;
    }
    
    .logout-btn:hover {
      color: #ef4444;
    }
    
    .logout-btn mat-icon {
      font-size: 22px !important;
      width: 22px !important;
      height: 22px !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }
    
    .content {
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: calc(100vh - 70px);
    }
    
    mat-card {
      margin-bottom: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    
    mat-card-header {
      padding-bottom: 1rem;
    }
    
    mat-card-title {
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    mat-card-content p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .sidenav {
        width: 100vw;
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
      
      .content {
        padding: 1rem;
        min-height: calc(100vh - 64px);
      }
      
      mat-card {
        margin-bottom: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .content {
        padding: 0.75rem;
      }
      
      .main-toolbar {
        padding: 0 0.75rem;
      }
      
      .toolbar-title {
        font-size: 1.1rem;
      }
      
      .user-info {
        gap: 0.5rem;
        padding: 0.5rem;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      .sidenav-container {
        background: #111827;
      }
      
      .sidenav {
        background: #1f2937;
        border-right-color: #374151;
      }
      
      .nav-list mat-list-item:hover {
        background: #065f46;
      }
      
      .nav-list mat-list-item:hover mat-icon {
        color: #10b981;
      }
      
      .main-toolbar {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        color: #ffffff;
        border-bottom-color: #374151;
      }
      
      .toolbar-title {
        color: #ffffff;
      }
      
      .user-name {
        color: #ffffff;
      }
      
      .logout-btn {
        color: #9ca3af;
      }
      
      .logout-btn:hover {
        color: #ef4444;
      }
      
      .content {
        background: #111827;
      }
      
      mat-card {
        background: #1f2937;
        border-color: #374151;
      }
      
      mat-card-title {
        color: #ffffff;
      }
      
      mat-card-content p {
        color: #d1d5db;
      }
    }
  `]
})
export class StaffDashboardComponent implements OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  activeSection = 'appointments';
  currentUser: any;
  isHandset = false;
  private destroyed = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroyed))
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
  }

  closeSidenavIfHandset(): void {
    if (this.isHandset && this.drawer) {
      this.drawer.close();
    }
  }

  getUserAvatar(): string {
    const name = this.currentUser?.name || 'Staff';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}