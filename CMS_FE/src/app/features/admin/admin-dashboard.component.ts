import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InviteUserComponent } from './invite-user.component';
import { BulkInviteComponent } from './bulk-invite.component';
import { AcceptInvitationComponent } from './accept-invitation.component';
import { TemplateCreateComponent } from '../notifications/components/template-create/template-create.component';
import { TemplateListComponent } from '../notifications/components/template-list/template-list.component';

@Component({
  selector: 'app-admin-dashboard',
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
    MatSlideToggleModule,
    FormsModule,
    RouterOutlet,
    InviteUserComponent,
    BulkInviteComponent,
    AcceptInvitationComponent,
    TemplateCreateComponent,
    TemplateListComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" [mode]="isHandset ? 'over' : 'side'" [opened]="!isHandset" [fixedInViewport]="true">
        <mat-toolbar class="sidenav-toolbar">
          <mat-icon class="brand-icon">local_hospital</mat-icon>
          <span class="brand-text">Admin Panel</span>
        </mat-toolbar>
        <mat-nav-list class="nav-list">
          <a mat-list-item (click)="setActiveSection('invite-staff'); closeSidenavIfHandset()" [class.active]="activeSection === 'invite-staff'">
            <mat-icon matListItemIcon>person_add</mat-icon>
            <span matListItemTitle>Invite Staff</span>
          </a>
          <a mat-list-item (click)="setActiveSection('create-templates'); closeSidenavIfHandset()" [class.active]="activeSection === 'create-templates'">
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Create Templates</span>
          </a>
          <a mat-list-item (click)="setActiveSection('manage-templates'); closeSidenavIfHandset()" [class.active]="activeSection === 'manage-templates'">
            <mat-icon matListItemIcon>list</mat-icon>
            <span matListItemTitle>Manage Templates</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="main-toolbar">
          <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="spacer"></span>
          <div class="user-info">
            <img [src]="getUserAvatar()" alt="User Avatar" class="user-avatar">
            <span class="user-name">{{ currentUser?.name || 'Admin' }}</span>
            <button mat-icon-button (click)="logout()" class="logout-btn" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <div class="content">
          <div [ngSwitch]="activeSection">
            <div *ngSwitchCase="'invite-staff'">
              <div class="section-header">
                <div class="section-info">
                  <h2>Invite Staff Members</h2>
                  <p>Send invitations to new staff members and doctors</p>
                </div>
                <div class="toggle-container">
                  <span class="toggle-label">Single Invite</span>
                  <mat-slide-toggle [(ngModel)]="isBulkInvite" class="invite-toggle">
                  </mat-slide-toggle>
                  <span class="toggle-label">Bulk Invite</span>
                </div>
              </div>
              
              <div class="invite-content">
                <invite-user *ngIf="!isBulkInvite"></invite-user>
                <bulk-invite *ngIf="isBulkInvite"></bulk-invite>
              </div>
            </div>

            <div *ngSwitchCase="'create-templates'">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Create Notification Templates</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Create new email and SMS templates for notifications.</p>
                  <app-template-create></app-template-create>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngSwitchCase="'manage-templates'">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Manage Templates</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>View, edit, and delete existing notification templates.</p>
                  <app-template-list></app-template-list>
                </mat-card-content>
              </mat-card>
            </div>

            <div *ngSwitchDefault>
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Admin Dashboard</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>Welcome to the admin panel. Select an option from the sidebar.</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* Ensure Material Icons are loaded */
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
    
    /* Global icon fixes */
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
    

    
    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .toolbar-brand .brand-icon {
      color: #10b981;
      font-size: 32px !important;
      width: 32px !important;
      height: 32px !important;
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
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem 2rem;
      color: #1f2937;
    }
    
    .section-info h2 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }
    
    .section-info p {
      font-size: 1.1rem;
      margin: 0;
      color: #6b7280;
    }
    
    .toggle-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    
    .toggle-label {
      font-weight: 500;
      font-size: 0.95rem;
      color: #ffffff;
    }
    
    .invite-toggle {
      --mdc-switch-selected-track-color: #ffffff;
      --mdc-switch-selected-handle-color: #10b981;
      --mdc-switch-unselected-track-color: rgba(255, 255, 255, 0.3);
      --mdc-switch-unselected-handle-color: #ffffff;
    }
    
    .invite-content {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
    
    ::ng-deep .mat-mdc-raised-button.mat-primary {
      background-color: #10b981 !important;
    }
    
    ::ng-deep .mat-mdc-raised-button.mat-primary:hover {
      background-color: #059669 !important;
    }
    
    /* Mobile Styles */
    @media (max-width: 768px) {
      .sidenav {
        width: 100vw;
        max-width: 320px;
      }
      
      .main-toolbar {
        padding: 0 1rem;
        height: 64px;
      }
      
      .toolbar-brand .brand-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
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
      
      .section-header {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
        padding: 1.5rem;
      }
      
      .section-info h2 {
        font-size: 1.5rem;
      }
      
      .section-info p {
        font-size: 1rem;
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
      
      .section-header {
        padding: 1rem;
      }
      
      .toggle-container {
        padding: 0.75rem 1rem;
      }
    }
    
    /* Dark Mode */
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
      
      .section-header {
        color: #ffffff;
      }
      
      .section-info h2 {
        color: #ffffff;
      }
      
      .section-info p {
        color: #d1d5db;
      }
      
      .toggle-container {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      
      .toggle-label {
        color: #ffffff;
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
export class AdminDashboardComponent implements OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  activeSection = 'invite-staff';
  currentUser: any;
  isHandset = false;
  isBulkInvite = false;
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
    const name = this.currentUser?.name || 'Admin';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}