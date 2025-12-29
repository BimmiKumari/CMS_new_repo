import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { DoctorSelectorComponent } from '../appointments/components/doctor-selector/doctor-selector.component';
import { BaseCalComponent } from '../calendar/components/base-cal/base-cal.component';
import { TimeslotButtonComponent } from '../appointments/components/timeslot-button/timeslot-button.component';
import { PatientdetailsComp } from '../appointments/components/patientdetails-comp/patientdetails-comp';
import { AfterpaymentComp } from '../appointments/components/afterpayment-comp/afterpayment-comp';
import { CalendarService, Doctor } from '../calendar/services/calendar.service';
import { SPECIALIZATIONS } from '../../shared/constants/specializations';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { ProfileSetupComponent } from '../../shared/components/profile-setup.component';
import { HealthRecordsComponent } from './components/health-records/health-records.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar.component';

@Component({
  selector: 'app-patient-dashboard',
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
    RouterOutlet,
    DoctorSelectorComponent,
    BaseCalComponent,
    TimeslotButtonComponent,
    PatientdetailsComp,
    AfterpaymentComp,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    HealthRecordsComponent,
    PatientProfileComponent,
    UserAvatarComponent
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" [mode]="isHandset ? 'over' : 'side'" [opened]="!isHandset" [fixedInViewport]="true">
        <mat-toolbar class="sidenav-toolbar">
          <mat-icon class="brand-icon">local_hospital</mat-icon>
          <span class="brand-text">Patient Portal</span>
        </mat-toolbar>
        
        <mat-nav-list class="nav-list">
          <a mat-list-item (click)="setActiveSection('book-appointment'); closeSidenavIfHandset()" [class.active]="activeSection === 'book-appointment'">
            <mat-icon matListItemIcon>event</mat-icon>
            <span matListItemTitle>Book Appointment</span>
          </a>
          <a mat-list-item (click)="setActiveSection('upcoming'); closeSidenavIfHandset()" [class.active]="activeSection === 'upcoming'">
            <mat-icon matListItemIcon>schedule</mat-icon>
            <span matListItemTitle>My Appointments</span>
          </a>
          <a mat-list-item (click)="setActiveSection('health-records'); closeSidenavIfHandset()" [class.active]="activeSection === 'health-records'">
            <mat-icon matListItemIcon>folder_shared</mat-icon>
            <span matListItemTitle>My Health Records</span>
          </a>
          <a mat-list-item (click)="setActiveSection('profile'); closeSidenavIfHandset()" [class.active]="activeSection === 'profile'">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>My Profile</span>
          </a>
        </mat-nav-list>


      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="main-toolbar">
          <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">Patient Dashboard</span>
          <span class="spacer"></span>
          <div class="user-info">
            <app-user-avatar
              [profilePictureURL]="currentUser?.profilePictureURL || ''"
              [name]="currentUser?.name || 'Patient'"
              [size]="36">
            </app-user-avatar>
            <span class="user-name">{{ currentUser?.name || 'Patient' }}</span>
            <button mat-icon-button (click)="logout()" class="logout-btn" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>
        
        <div class="content">
          <div [ngSwitch]="activeSection">
            
            <!-- Book Appointment Section -->
            <div *ngSwitchCase="'book-appointment'">
              <!-- Payment Success -->
              <div *ngIf="showPaymentSuccess" class="payment-success-container">
                <div class="back-button-container">
                  <button mat-icon-button (click)="goBackToBooking()" class="back-btn">
                    <mat-icon>arrow_back</mat-icon>
                  </button>
                  <span class="back-text">Book Another Appointment</span>
                </div>
                <app-afterpayment-comp [paymentData]="paymentDetails"></app-afterpayment-comp>
              </div>
              
              <!-- Patient Form -->
              <div *ngIf="showPatientForm && !showPaymentSuccess" class="patient-form-container">
                <div class="back-button-container">
                  <button mat-icon-button (click)="goBackToBooking()" class="back-btn">
                    <mat-icon>arrow_back</mat-icon>
                  </button>
                  <span class="back-text">Back to Booking</span>
                </div>
                <app-patientdetails-comp></app-patientdetails-comp>
              </div>
              
              <!-- Booking Form -->
              <div *ngIf="!showPatientForm && !showPaymentSuccess" class="booking-container">
                <!-- Top Row: Specialization and Doctor Selection -->
                <div class="selection-row">
                  <div class="form-group">
                    <label>1. Select Specialization</label>
                    <mat-form-field appearance="outline" class="full-width-field">
                      <mat-label>Choose category</mat-label>
                      <mat-select 
                        [(value)]="selectedSpecialization" 
                        (selectionChange)="onSpecializationChange($event.value)"
                      >
                        <mat-option [value]="''">All Specialties</mat-option>
                        <mat-option *ngFor="let spec of specializations" [value]="spec">
                          {{ spec }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                  
                  <div class="form-group">
                    <label>2. Select Specialist</label>
                    <app-doctor-selector
                      [doctors]="filteredDoctors"
                      [selectedDrId]="selectedDoctor?.id || ''"
                      (doctorChange)="onDoctorChange($event)"
                    >
                    </app-doctor-selector>
                  </div>
                </div>
                
                <!-- Calendar Section -->
                <div class="form-group calendar-section">
                  <label>3. Select Date</label>
                  <div class="calendar-wrapper">
                    <app-base-cal (selectedChange)="onDateChange($event)"></app-base-cal>
                  </div>
                </div>
                
                <!-- Slots Section -->
                <div class="form-group slots-section">
                  <label>4. Available Time Slots</label>
                  
                  <div class="slots-container">
                    <div *ngIf="loadingSlots" class="loading-overlay">
                      <mat-icon class="spin">sync</mat-icon>
                      <span>Finding slots...</span>
                    </div>

                    <div *ngIf="!loadingSlots && timeSlots.length === 0" class="empty-slots">
                      <mat-icon>info</mat-icon>
                      <p>Select a doctor and date to check availability.</p>
                    </div>

                    <app-timeslot-button
                      *ngIf="!loadingSlots && timeSlots.length > 0"
                      [slots]="timeSlots"
                      [selectedSlot]="selectedTimeSlot"
                      (slotChange)="onTimeSlotChange($event)"
                    >
                    </app-timeslot-button>
                  </div>

                  <div class="booking-action" *ngIf="isFormValid()">
                    <button mat-raised-button class="confirm-btn" (click)="onProceed()">
                      <mat-icon>check_circle</mat-icon>
                      Confirm Selection
                    </button>
                    <p class="summary">
                      {{ selectedDoctor?.name }} on {{ selectedDate | date:'fullDate' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Appointments -->
            <div *ngSwitchCase="'upcoming'">
              <div class="appointments-container">
                <div class="appointments-header">
                  <h1>My Appointments</h1>
                  <p>View your upcoming and completed appointments</p>
                </div>

                <div *ngIf="loadingAppointments" class="loading-state">
                  <mat-icon class="spin">sync</mat-icon>
                  <p>Loading appointments...</p>
                </div>

                <div *ngIf="!loadingAppointments" class="appointments-grid">
                  <!-- All Appointments -->
                  <div class="appointments-column">
                    <h2><mat-icon>event</mat-icon> All My Appointments</h2>
                    <div *ngIf="upcomingAppointments.length === 0" class="no-appointments">
                      <mat-icon>event_available</mat-icon>
                      <p>No upcoming appointments</p>
                      <button mat-stroked-button color="primary" (click)="setActiveSection('book-appointment')">
                        Book Appointment
                      </button>
                    </div>
                    <mat-card *ngFor="let appointment of upcomingAppointments" class="appointment-card upcoming">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="upcoming-icon">event</mat-icon>
                        <mat-card-title>Dr. {{ appointment.doctorName }}</mat-card-title>
                        <mat-card-subtitle>{{ appointment.appointmentDate | date:'fullDate' }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="appointment-details">
                          <div class="detail-item">
                            <mat-icon>access_time</mat-icon>
                            <span>{{ appointment.startTime }} - {{ appointment.endTime }}</span>
                          </div>
                          <div class="detail-item">
                            <mat-icon>info</mat-icon>
                            <span class="status-badge" [ngClass]="getStatusClass(appointment)">{{ getStatusText(appointment) }}</span>
                          </div>
                          <div class="detail-item" *ngIf="appointment.reasonForVisit">
                            <mat-icon>description</mat-icon>
                            <span>{{ appointment.reasonForVisit }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>

                  <!-- Hidden Completed Section -->
                  <div class="appointments-column" style="display: none;">
                    <h2><mat-icon>check_circle</mat-icon> Completed Appointments</h2>
                    <div *ngIf="completedAppointments.length === 0" class="no-appointments">
                      <mat-icon>history</mat-icon>
                      <p>No completed appointments</p>
                    </div>
                    <mat-card *ngFor="let appointment of completedAppointments" class="appointment-card completed">
                      <mat-card-header>
                        <mat-icon mat-card-avatar class="completed-icon">check_circle</mat-icon>
                        <mat-card-title>Dr. {{ appointment.doctorName }}</mat-card-title>
                        <mat-card-subtitle>{{ appointment.appointmentDate | date:'fullDate' }}</mat-card-subtitle>
                      </mat-card-header>
                      <mat-card-content>
                        <div class="appointment-details">
                          <div class="detail-item">
                            <mat-icon>access_time</mat-icon>
                            <span>{{ appointment.startTime }} - {{ appointment.endTime }}</span>
                          </div>
                          <div class="detail-item">
                            <mat-icon>info</mat-icon>
                            <span class="status-badge" [ngClass]="getStatusClass(appointment)">{{ getStatusText(appointment) }}</span>
                          </div>
                          <div class="detail-item" *ngIf="appointment.reasonForVisit">
                            <mat-icon>description</mat-icon>
                            <span>{{ appointment.reasonForVisit }}</span>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  </div>
                </div>
              </div>
            </div>

            <!-- Health Records -->
            <div *ngSwitchCase="'health-records'">
              <app-health-records></app-health-records>
            </div>

            <!-- My Profile -->
            <div *ngSwitchCase="'profile'">
              <app-patient-profile></app-patient-profile>
            </div>

            <!-- Welcome Screen -->
            <div *ngSwitchDefault>
              <div class="welcome-section">
                <h1>Hello, {{ currentUser?.name }}</h1>
                <p>Welcome to your personal health portal. How can we help you today?</p>
                
                <div class="quick-actions">
                  <mat-card class="action-card" (click)="setActiveSection('book-appointment')">
                    <mat-icon color="primary">event</mat-icon>
                    <h3>Book Appointment</h3>
                    <p>Schedule a visit with a specialist.</p>
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
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: calc(100vh - 70px);
    }
    .page-title {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 32px;
      letter-spacing: -0.5px;
    }
    .booking-container {
      padding: 2rem;
      width: 100%;
      height: 100%;
    }
    
    .selection-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .calendar-section {
      margin-bottom: 2rem;
    }
    
    .calendar-wrapper {
      display: flex;
      justify-content: center;
      padding: 1rem;
      width: 100%;
    }
    
    .calendar-wrapper ::ng-deep .calendar-container {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      width: 100% !important;
      max-width: 900px;
    }
    
    .calendar-wrapper ::ng-deep table {
      border-collapse: separate;
      border-spacing: 12px;
      width: 100%;
      table-layout: fixed;
    }
    
    .calendar-wrapper ::ng-deep th {
      color: #6b7280;
      font-weight: 600;
      font-size: 1rem;
      padding: 1rem 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }
    
    .calendar-wrapper ::ng-deep td {
      padding: 0;
      text-align: center;
    }
    
    .calendar-wrapper ::ng-deep td button {
      width: 60px;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 1rem;
      transition: all 0.2s ease;
      border: 1px solid #e5e7eb;
    }
    
    .calendar-wrapper ::ng-deep td button:hover {
      background: #f0fdf4 !important;
      color: #10b981 !important;
      border-color: #10b981 !important;
      transform: scale(1.02);
    }
    
    .calendar-wrapper ::ng-deep td button.selected {
      background: #10b981 !important;
      color: white !important;
      border-color: #10b981 !important;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
    
    .calendar-wrapper ::ng-deep .calendar-header {
      margin-bottom: 1rem;
      padding: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2rem;
    }
    
    .calendar-wrapper ::ng-deep .calendar-header button {
      color: #10b981;
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .slots-section {
      margin-bottom: 0;
    }

    .form-group {
      margin-bottom: 0;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .full-width-field {
      width: 100%;
    }
    .slots-container {
      min-height: 200px;
      display: flex;
      flex-direction: column;
    }
    .loading-overlay, .empty-slots {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      text-align: center;
      gap: 12px;
    }
    .spin {
      animation: rotate 2s linear infinite;
    }
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .booking-action {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }
    .confirm-btn {
      width: 100%;
      height: 54px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      background-color: #10b981 !important;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .confirm-btn:hover {
      background-color: #059669 !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .summary {
      margin-top: 12px;
      color: #64748b;
      font-size: 14px;
    }
    .welcome-section {
      text-align: center;
      padding-top: 60px;
    }
    .welcome-section h1 {
      font-size: 48px;
      font-weight: 800;
      color: #0f172a;
    }
    .quick-actions {
      margin-top: 48px;
      display: flex;
      justify-content: center;
    }
    .action-card {
      width: 300px;
      padding: 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
    }
    .action-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      margin-bottom: 16px;
    }
    mat-card {
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    
    mat-card-content p {
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
    
    /* Responsive Design */
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
        padding: 0;
        min-height: calc(100vh - 64px);
      }
      
      .booking-container {
        padding: 1rem;
      }
      
      .selection-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .page-title {
        font-size: 1.75rem;
      }
      
      .welcome-section h1 {
        font-size: 2rem;
      }
      
      .action-card {
        width: 100%;
        padding: 1.5rem;
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
      }
      
      .calendar-wrapper ::ng-deep td button {
        width: 45px;
        height: 35px;
        font-size: 0.9rem;
      }
      
      .calendar-wrapper ::ng-deep table {
        border-spacing: 8px;
      }
      
      .page-title {
        font-size: 1.5rem;
      }
    }
    
    /* Dark Mode Support */
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
      
      .calendar-wrapper ::ng-deep th {
        color: #d1d5db;
      }
      
      .calendar-wrapper ::ng-deep td button {
        border-color: #4b5563;
      }
      
      .calendar-wrapper ::ng-deep td button:hover {
        background: #065f46 !important;
        color: #10b981 !important;
        border-color: #10b981 !important;
      }
      
      .page-title,
      .welcome-section h1 {
        color: #ffffff;
      }
      
      mat-card-content p {
        color: #d1d5db;
      }
      
      .form-group label,
      .slots-card label {
        color: #d1d5db;
      }
      
      .summary {
        color: #d1d5db;
      }
    }
    
    .patient-form-container,
    .payment-success-container {
      width: 100%;
    }
    
    .back-button-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem 0;
    }
    
    .back-btn {
      color: #10b981;
      transition: all 0.2s ease;
    }
    
    .back-btn:hover {
      background: #f0fdf4;
      transform: scale(1.05);
    }
    
    .back-text {
      color: #1f2937;
      font-weight: 500;
      font-size: 0.95rem;
    }
    
    @media (prefers-color-scheme: dark) {
      .back-text {
        color: #ffffff;
      }
    }
    
    /* Appointments Styles */
    .appointments-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .appointments-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .appointments-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }
    
    .appointments-header p {
      color: #64748b;
      font-size: 1rem;
    }
    
    .appointments-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    
    .appointments-column h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    
    .appointment-card {
      margin-bottom: 1rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }
    
    .appointment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .appointment-card.upcoming {
      border-left: 4px solid #10b981;
    }
    
    .appointment-card.completed {
      border-left: 4px solid #6b7280;
    }
    
    .upcoming-icon {
      background: #10b981 !important;
      color: white !important;
    }
    
    .completed-icon {
      background: #6b7280 !important;
      color: white !important;
    }
    
    .appointment-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.9rem;
    }
    
    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #10b981;
    }
    
    .no-appointments {
      text-align: center;
      padding: 2rem;
      color: #64748b;
    }
    
    .no-appointments mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      color: #d1d5db;
    }
    
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-waiting {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-progress {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .status-completed {
      background: #dcfce7;
      color: #15803d;
    }
    
    .status-cancelled {
      background: #fee2e2;
      color: #dc2626;
    }
    
    .status-noshow {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .status-scheduled {
      background: #e0e7ff;
      color: #3730a3;
    }
    
    @media (max-width: 768px) {
      .appointments-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .appointments-container {
        padding: 1rem;
      }
    }
  `]
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  activeSection = 'book-appointment';
  currentUser: any;
  isHandset = false;
  private destroyed = new Subject<void>();
  showPatientForm = false;
  showPaymentSuccess = false;
  paymentDetails: any = null;

  selectedDoctor?: Doctor;
  selectedDate?: Date;
  selectedTimeSlot?: string;
  loadingSlots = false;

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  specializations: string[] = SPECIALIZATIONS;
  selectedSpecialization: string = '';
  timeSlots: string[] = [];

  // Appointments data
  appointments: any[] = [];
  upcomingAppointments: any[] = [];
  completedAppointments: any[] = [];
  loadingAppointments = false;

  constructor(
    private authService: AuthService,
    private calendarService: CalendarService,
    private appointmentService: AppointmentService,
    private router: Router,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroyed)).subscribe(user => {
      this.currentUser = user;
    });
    
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

  closeSidenavIfHandset(): void {
    if (this.isHandset && this.drawer) {
      this.drawer.close();
    }
  }

  getUserAvatar(): string {
    // Prefer uploaded profile picture URL if available
    const url = this.currentUser?.profilePictureURL;
    if (url && typeof url === 'string' && url.trim().length > 0) return url;
    const name = this.currentUser?.name || 'Patient';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  ngOnInit(): void {
    this.loadDoctors();
    
    // Check for payment success from query params
    this.route.queryParams.subscribe(params => {
      if (params['paymentSuccess'] === 'true') {
        this.paymentDetails = {
          billPath: params['billPath'] || '',
          amount: params['amount'] || 0,
          originalAmount: params['originalAmount'] || 0,
          discountAmount: params['discountAmount'] || 0,
          isFollowup: params['isFollowup'] === 'true'
        };
        this.showPaymentSuccess = true;
        // Clear query params
        this.router.navigate([], { queryParams: {} });
      }
    });
  }

  loadDoctors(): void {
    this.calendarService.getAllDoctors().subscribe({
      next: (response) => {
        if (response.success) {
          this.doctors = response.data;
          this.filteredDoctors = response.data;
        }
      },
      error: (error) => console.error('Error loading doctors:', error)
    });
  }

  onSpecializationChange(spec: string): void {
    this.selectedSpecialization = spec;
    if (spec) {
      this.filteredDoctors = this.doctors.filter(d => d.specialization === spec);
    } else {
      this.filteredDoctors = this.doctors;
    }

    // Clear selected doctor if they don't match the new specialization
    if (this.selectedDoctor && this.selectedDoctor.specialization !== spec && spec !== '') {
      this.selectedDoctor = undefined;
      this.selectedTimeSlot = undefined;
      this.timeSlots = [];
    }
  }

  loadAvailableSlots(): void {
    if (this.selectedDoctor && this.selectedDate) {
      this.loadingSlots = true;
      const year = this.selectedDate.getFullYear();
      const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      this.calendarService.getAvailableSlots(this.selectedDoctor.id, formattedDate).subscribe({
        next: (response) => {
          if (response.success) {
            this.timeSlots = response.data.availableSlots.map((slot: any) => slot.displayTime);
          }
          this.loadingSlots = false;
        },
        error: (error) => {
          console.error('Error loading slots:', error);
          this.loadingSlots = false;
        }
      });
    }
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (section === 'upcoming') {
      this.loadAppointments();
    }
    if (section !== 'book-appointment') {
      this.selectedDoctor = undefined;
      this.selectedDate = undefined;
      this.selectedTimeSlot = undefined;
      this.timeSlots = [];
    }
  }

  loadAppointments(): void {
    const patientId = this.currentUser?.userID || this.currentUser?.userId || this.currentUser?.id;
    console.log('=== LOADING APPOINTMENTS DEBUG ===');
    console.log('Current user object:', this.currentUser);
    console.log('Patient ID for API call:', patientId);
    
    if (!patientId) {
      console.log('No patient ID found, stopping appointment load');
      this.loadingAppointments = false;
      return;
    }

    this.loadingAppointments = true;
    console.log('Making API call to:', `Appointments/patient/${patientId}`);
    
    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (response: any) => {
        console.log('API Response received:', response);
        console.log('Response type:', typeof response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        
        if (response && response.success && response.data) {
          this.appointments = response.data;
          console.log('Appointments from response.data:', this.appointments);
        } else if (response && Array.isArray(response)) {
          this.appointments = response;
          console.log('Appointments from direct array:', this.appointments);
        } else {
          this.appointments = [];
          console.log('No appointments found in response');
        }
        
        console.log('Final appointments array:', this.appointments);
        console.log('Appointments count:', this.appointments.length);
        
        this.categorizeAppointments();
        this.loadingAppointments = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        this.appointments = [];
        this.upcomingAppointments = [];
        this.completedAppointments = [];
        this.loadingAppointments = false;
      }
    });
  }

  categorizeAppointments(): void {
    // Show ALL appointments without filtering
    this.upcomingAppointments = this.appointments;
    this.completedAppointments = [];
  }

  getStatusText(appointment: any): string {
    const queueStatus = appointment.queueStatus || appointment.status;
    switch (queueStatus) {
      case 1: return 'Waiting';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      case 5: return 'No Show';
      default: return 'Scheduled';
    }
  }

  getStatusClass(appointment: any): string {
    const queueStatus = appointment.queueStatus || appointment.status;
    switch (queueStatus) {
      case 1: return 'status-waiting';
      case 2: return 'status-progress';
      case 3: return 'status-completed';
      case 4: return 'status-cancelled';
      case 5: return 'status-noshow';
      default: return 'status-scheduled';
    }
  }

  onDoctorChange(doctor: Doctor) {
    this.selectedDoctor = doctor;
    this.selectedTimeSlot = undefined;
    this.loadAvailableSlots();
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.selectedTimeSlot = undefined;
    this.loadAvailableSlots();
  }

  onTimeSlotChange(slot: string) {
    this.selectedTimeSlot = slot;
  }

  onProceed() {
    if (this.isFormValid()) {
      const formattedDate = this.selectedDate!.toISOString().split('T')[0];

      // Extract just the start time (before the dash) for easier matching
      const startTimeOnly = this.selectedTimeSlot!.split(' - ')[0];
      
      // Store appointment details in session storage for use in patient details form
      const appointmentData = {
        doctorId: this.selectedDoctor!.id,
        doctorName: this.selectedDoctor!.name,
        patientId: this.currentUser?.userId || this.currentUser?.id || this.currentUser?.userID,
        appointmentDate: formattedDate,
        startTime: startTimeOnly,  // Store only start time
        fullTimeSlot: this.selectedTimeSlot!,  // Store full slot for display
        endTime: '',
        status: 'Scheduled',
        notes: 'Booked via portal'
      };
      
      console.log('Storing appointment data:', appointmentData);
      console.log('Current user object:', this.currentUser);

      sessionStorage.setItem('pendingAppointment', JSON.stringify(appointmentData));

      // Show patient form in same place
      this.showPatientForm = true;
    }
  }

  goBackToBooking() {
    this.showPatientForm = false;
    this.showPaymentSuccess = false;
    this.paymentDetails = null;
  }

  showPaymentSuccessPage(paymentDetails: any) {
    this.showPatientForm = false;
    this.showPaymentSuccess = true;
    this.paymentDetails = paymentDetails;
  }

  isFormValid(): boolean {
    return !!(this.selectedDoctor && this.selectedDate && this.selectedTimeSlot);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}