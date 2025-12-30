import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="patient-management-card">
      <mat-card-header>
        <mat-card-title>Patient Management</mat-card-title>
        <mat-card-subtitle>All patients from appointments with their details</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Search Filter -->
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search patients</mat-label>
            <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, email, or phone">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading patients...</p>
        </div>

        <!-- Patients Table -->
        <div *ngIf="!loading" class="table-container">
          <table mat-table [dataSource]="filteredPatients" class="patients-table">
            
            <!-- Avatar Column -->
            <ng-container matColumnDef="avatar">
              <th mat-header-cell *matHeaderCellDef>Photo</th>
              <td mat-cell *matCellDef="let patient">
                <img [src]="getPatientAvatar(patient)" 
                     [alt]="patient.name + ' Avatar'" 
                     class="patient-avatar">
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let patient">
                <div class="patient-name">
                  <strong>{{ patient.name }}</strong>
                </div>
              </td>
            </ng-container>

            <!-- Contact Column -->
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let patient">
                <div class="contact-info">
                  <div class="email">
                    <mat-icon>email</mat-icon>
                    {{ patient.email }}
                  </div>
                  <div class="phone" *ngIf="patient.phoneNumber">
                    <mat-icon>phone</mat-icon>
                    {{ patient.phoneNumber }}
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Appointments Column -->
            <ng-container matColumnDef="appointments">
              <th mat-header-cell *matHeaderCellDef>Appointments</th>
              <td mat-cell *matCellDef="let patient">
                <div class="appointment-count">
                  <mat-icon>event</mat-icon>
                  {{ patient.appointmentCount }} appointment(s)
                </div>
              </td>
            </ng-container>

            <!-- Last Visit Column -->
            <ng-container matColumnDef="lastVisit">
              <th mat-header-cell *matHeaderCellDef>Last Visit</th>
              <td mat-cell *matCellDef="let patient">
                <div class="last-visit" *ngIf="patient.lastAppointmentDate">
                  {{ patient.lastAppointmentDate | date:'mediumDate' }}
                </div>
                <div class="no-visit" *ngIf="!patient.lastAppointmentDate">
                  No visits yet
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let patient">
                <button mat-icon-button matTooltip="View Details" (click)="viewPatientDetails(patient)">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button matTooltip="Take Action" (click)="takeAction(patient)">
                  <mat-icon>send</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- No Data State -->
          <div *ngIf="filteredPatients.length === 0" class="no-data">
            <mat-icon>people_outline</mat-icon>
            <h3>No patients found</h3>
            <p>No patients have been registered through appointments yet.</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .patient-management-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .search-container {
      margin-bottom: 2rem;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #6b7280;
    }

    .loading-container p {
      margin-top: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .patients-table {
      width: 100%;
      background: white;
      border-radius: 8px;
    }

    .patient-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }

    .patient-name {
      display: flex;
      flex-direction: column;
    }

    .patient-name strong {
      font-weight: 600;
      color: #1f2937;
    }

    .patient-name small {
      color: #6b7280;
      font-size: 0.75rem;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-info .email,
    .contact-info .phone {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .contact-info mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #10b981;
    }

    .appointment-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1f2937;
    }

    .appointment-count mat-icon {
      color: #10b981;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .last-visit {
      color: #1f2937;
      font-weight: 500;
    }

    .no-visit {
      color: #6b7280;
      font-style: italic;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #6b7280;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .no-data h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .no-data p {
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .patients-table {
        font-size: 0.875rem;
      }
      
      .patient-avatar {
        width: 32px;
        height: 32px;
      }
      
      .contact-info {
        font-size: 0.75rem;
      }
    }
  `]
})
export class PatientManagementComponent implements OnInit {
  displayedColumns: string[] = ['avatar', 'name', 'contact', 'appointments', 'lastVisit', 'actions'];
  patients: any[] = [];
  filteredPatients: any[] = [];
  loading = false;
  @Output() navigateToSection = new EventEmitter<string>();

  constructor(private appointmentService: AppointmentService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    console.log('🔄 Loading patients from appointments...');
    
    // Try the main endpoint first
    this.appointmentService.getAllAppointments().subscribe({
      next: (response) => {
        this.handleAppointmentsResponse(response);
      },
      error: (error) => {
        console.error('❌ Main endpoint failed:', error);
        // Try fallback endpoint
        this.tryFallbackEndpoint();
      }
    });
  }

  tryFallbackEndpoint(): void {
    console.log('🔄 Trying fallback endpoint...');
    this.appointmentService.getAllAppointmentsViaPatients().subscribe({
      next: (response) => {
        console.log('✅ Fallback endpoint worked');
        this.handleAppointmentsResponse(response);
      },
      error: (error) => {
        console.error('❌ Fallback endpoint also failed:', error);
        this.patients = [];
        this.filteredPatients = [];
        this.loading = false;
      }
    });
  }

  handleAppointmentsResponse(response: any): void {
    console.log('📋 Raw API response:', response);
    
    let appointments = [];
    
    // Handle the test/all endpoint response format
    if (response?.success && response?.appointments) {
      appointments = response.appointments;
      console.log('✅ Using response.appointments:', appointments);
    } else if (response?.appointments) {
      appointments = response.appointments;
      console.log('✅ Using response.appointments (no success flag):', appointments);
    } else if (response?.success && response?.data) {
      appointments = response.data;
      console.log('✅ Using response.data:', appointments);
    } else if (Array.isArray(response)) {
      appointments = response;
      console.log('✅ Using direct array response:', appointments);
    } else if (response && typeof response === 'object') {
      // Try to find array in response object
      const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        appointments = possibleArrays[0] as any[];
        console.log('✅ Found array in response object:', appointments);
      }
    }
    
    console.log('📊 Final appointments array:', appointments);
    console.log('📊 Appointments count:', appointments.length);
    
    if (Array.isArray(appointments) && appointments.length > 0) {
      console.log('📝 Sample appointment:', appointments[0]);
      this.extractPatientsFromAppointments(appointments);
    } else {
      console.log('⚠️ No appointments found or invalid format');
      this.patients = [];
      this.filteredPatients = [];
    }
    this.loading = false;
  }

  extractPatientsFromAppointments(appointments: any[]): void {
    console.log('🔍 Extracting patients from appointments:', appointments.length, 'appointments');
    console.log('🔍 Sample appointment structure:', appointments[0]);
    
    const patientMap = new Map();
    let processedCount = 0;
    
    appointments.forEach((appointment, index) => {
      // Handle different possible field names from API
      const patientId = appointment.patientId || appointment.patientID || appointment.PatientID || appointment.userId || appointment.UserID;
      const patientName = appointment.patientName || appointment.PatientName || appointment.userName || appointment.UserName || `Patient ${patientId}`;
      const patientEmail = appointment.PatientEmail || appointment.patientEmail || appointment.userEmail || appointment.email;
      const patientPhone = appointment.PatientPhone || appointment.patientPhone || appointment.phoneNumber || appointment.PhoneNumber;
      const appointmentDate = appointment.appointmentDate || appointment.AppointmentDate || appointment.date || appointment.Date;
      
      console.log(`🔍 Processing appointment ${index + 1}:`, {
        patientId,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate,
        originalAppointment: appointment
      });
      
      if (patientId) {
        processedCount++;
        
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: patientName,
            email: patientEmail || 'Not provided',
            phoneNumber: patientPhone || 'Not provided',
            profilePictureURL: appointment.patientProfilePicture || appointment.profilePictureURL || '',
            appointmentCount: 1,
            lastAppointmentDate: appointmentDate,
            appointments: [appointment]
          });
          console.log(`➕ Added new patient: ${patientName} (ID: ${patientId})`);
        } else {
          const patient = patientMap.get(patientId);
          patient.appointmentCount++;
          patient.appointments.push(appointment);
          
          if (appointmentDate && new Date(appointmentDate) > new Date(patient.lastAppointmentDate)) {
            patient.lastAppointmentDate = appointmentDate;
          }
          console.log(`🔄 Updated patient: ${patientName} (Total appointments: ${patient.appointmentCount})`);
        }
      } else {
        console.log(`⚠️ Skipping appointment ${index + 1} - no patient ID found`);
      }
    });
    
    const extractedPatients = Array.from(patientMap.values());
    console.log(`📊 Extraction complete:`);
    console.log(`   - Total appointments processed: ${appointments.length}`);
    console.log(`   - Appointments with patient ID: ${processedCount}`);
    console.log(`   - Unique patients found: ${extractedPatients.length}`);
    
    if (extractedPatients.length > 0) {
      this.patients = extractedPatients;
      this.filteredPatients = [...this.patients];
      console.log('✅ Successfully extracted patients:', this.patients);
    } else {
      console.log('⚠️ No valid patients found in appointments');
      this.patients = [];
      this.filteredPatients = [];
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(patient =>
      patient.name?.toLowerCase().includes(filterValue) ||
      patient.email?.toLowerCase().includes(filterValue) ||
      patient.phoneNumber?.toLowerCase().includes(filterValue)
    );
  }

  getPatientAvatar(patient: any): string {
    if (patient.profilePictureURL && patient.profilePictureURL.trim() !== '') {
      return patient.profilePictureURL;
    }
    const name = patient.name || 'Patient';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  viewPatientDetails(patient: any): void {
    this.dialog.open(PatientDetailsDialog, {
      width: '800px',
      maxHeight: '90vh',
      data: patient
    });
  }

  takeAction(patient: any): void {
    console.log('Take action for patient:', patient);
    this.navigateToSection.emit('reminders');
  }

  editPatient(patient: any): void {
    console.log('Edit patient:', patient);
    // TODO: Implement patient edit functionality
  }
}

@Component({
  selector: 'patient-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <h2 mat-dialog-title>Patient Details</h2>
    <mat-dialog-content>
      <div class="patient-details">
        <div class="patient-header">
          <img [src]="getPatientAvatar()" alt="Patient Avatar" class="patient-avatar">
          <div class="patient-info">
            <h3>{{ data.name }}</h3>
          </div>
        </div>
        
        <div class="details-grid">
          <div class="detail-item">
            <mat-icon>email</mat-icon>
            <div>
              <label>Email</label>
              <span>{{ data.email || 'Not provided' }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <mat-icon>phone</mat-icon>
            <div>
              <label>Phone</label>
              <span>{{ data.phoneNumber || 'Not provided' }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <mat-icon>event</mat-icon>
            <div>
              <label>Total Appointments</label>
              <span>{{ data.appointmentCount }}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <mat-icon>schedule</mat-icon>
            <div>
              <label>Last Visit</label>
              <span>{{ data.lastAppointmentDate | date:'mediumDate' || 'No visits yet' }}</span>
            </div>
          </div>
        </div>

        <!-- Appointments History -->
        <div class="appointments-section" *ngIf="data.appointments && data.appointments.length > 0">
          <h4>Appointment History</h4>
          <div class="appointments-list">
            <mat-card *ngFor="let appointment of data.appointments" class="appointment-card">
              <mat-card-content>
                <div class="appointment-header">
                  <div class="appointment-date">
                    <mat-icon>event</mat-icon>
                    {{ getAppointmentDate(appointment) | date:'mediumDate' }}
                  </div>
                  <div class="appointment-status" [ngClass]="getStatusClass(appointment)">
                    {{ getStatusText(appointment) }}
                  </div>
                </div>
                <div class="appointment-details">
                  <div class="detail" *ngIf="getDoctorName(appointment)">
                    <mat-icon>person</mat-icon>
                    <span>Dr. {{ getDoctorName(appointment) }}</span>
                  </div>
                  <div class="detail" *ngIf="getAppointmentTime(appointment)">
                    <mat-icon>access_time</mat-icon>
                    <span>{{ getAppointmentTime(appointment) }}</span>
                  </div>
                  <div class="detail" *ngIf="getReasonForVisit(appointment)">
                    <mat-icon>description</mat-icon>
                    <span>{{ getReasonForVisit(appointment) }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="editPatient()">Edit Patient</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .patient-details {
      padding: 1rem 0;
      height: 70vh;
      overflow-y: auto;
    }
    
    .patient-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .patient-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #10b981;
    }
    
    .patient-info h3 {
      margin: 0;
      color: #1f2937;
      font-weight: 600;
    }
    
    .patient-info p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .detail-item mat-icon {
      color: #10b981;
      margin-top: 0.25rem;
    }
    
    .detail-item label {
      display: block;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    
    .detail-item span {
      color: #1f2937;
    }

    .appointments-section {
      border-top: 1px solid #e5e7eb;
      padding-top: 1.5rem;
    }

    .appointments-section h4 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-weight: 600;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .appointment-card {
      margin-bottom: 1rem;
      border-radius: 8px;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .appointment-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .appointment-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-scheduled { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #dcfce7; color: #15803d; }
    .status-cancelled { background: #fee2e2; color: #dc2626; }
    .status-waiting { background: #fef3c7; color: #92400e; }

    .appointment-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .detail mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #10b981;
    }
    
    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class PatientDetailsDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PatientDetailsDialog>
  ) {}
  
  getPatientAvatar(): string {
    if (this.data.profilePictureURL && this.data.profilePictureURL.trim() !== '') {
      return this.data.profilePictureURL;
    }
    const name = this.data.name || 'Patient';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=10b981&textColor=ffffff`;
  }

  getAppointmentDate(appointment: any): string {
    return appointment.appointmentDate || appointment.AppointmentDate || appointment.date;
  }

  getDoctorName(appointment: any): string {
    return appointment.doctorName || appointment.DoctorName || appointment.doctor || '';
  }

  getAppointmentTime(appointment: any): string {
    const startTime = appointment.startTime || appointment.StartTime;
    const endTime = appointment.endTime || appointment.EndTime;
    if (startTime && endTime) {
      return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
    }
    return startTime ? this.formatTime(startTime) : '';
  }

  getReasonForVisit(appointment: any): string {
    return appointment.reasonForVisit || appointment.ReasonForVisit || appointment.notes || '';
  }

  getStatusText(appointment: any): string {
    const status = appointment.status || appointment.Status;
    if (typeof status === 'string') return status;
    switch (status) {
      case 1: return 'Scheduled';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      case 5: return 'No Show';
      default: return 'Scheduled';
    }
  }

  getStatusClass(appointment: any): string {
    const status = appointment.status || appointment.Status;
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        case 'waiting': return 'status-waiting';
        default: return 'status-scheduled';
      }
    }
    switch (status) {
      case 3: return 'status-completed';
      case 4: return 'status-cancelled';
      case 2: return 'status-waiting';
      default: return 'status-scheduled';
    }
  }

  formatTime(timeSpan: string): string {
    if (!timeSpan) return '';
    try {
      if (timeSpan.includes(':')) {
        const parts = timeSpan.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parts[1];
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        return `${displayHours}:${minutes} ${period}`;
      }
      return timeSpan;
    } catch {
      return timeSpan;
    }
  }
  
  editPatient(): void {
    this.dialogRef.close('edit');
  }
}