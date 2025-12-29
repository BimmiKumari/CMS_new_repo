import { Component, OnInit, Inject } from '@angular/core';
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
                  <small>ID: {{ patient.id }}</small>
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
                <button mat-icon-button matTooltip="Edit Patient" (click)="editPatient(patient)">
                  <mat-icon>edit</mat-icon>
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

  constructor(private appointmentService: AppointmentService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    console.log('Loading patients...');
    
    // Use mock data for now to test the UI
    setTimeout(() => {
      this.patients = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phoneNumber: '+1234567890',
          profilePictureURL: '',
          appointmentCount: 3,
          lastAppointmentDate: '2024-12-20'
        },
        {
          id: '2', 
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phoneNumber: '+1987654321',
          profilePictureURL: '',
          appointmentCount: 1,
          lastAppointmentDate: '2024-12-15'
        }
      ];
      this.filteredPatients = [...this.patients];
      this.loading = false;
      console.log('Mock patients loaded:', this.patients);
    }, 1000);
    
    // Also try the real API in parallel
    this.tryRealAPI();
  }

  tryRealAPI(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (response) => {
        console.log('Real API response:', response);
        // If we get real data, replace mock data
        if (response && (response.success ? response.data : response)) {
          const appointments = response.success ? response.data : response;
          if (Array.isArray(appointments) && appointments.length > 0) {
            this.extractPatientsFromAppointments(appointments);
          }
        }
      },
      error: (error) => {
        console.error('API Error:', error);
      }
    });
  }

  extractPatientsFromAppointments(appointments: any[]): void {
    console.log('Extracting patients from appointments:', appointments);
    const patientMap = new Map();
    
    appointments.forEach(appointment => {
      const patientId = appointment.patientId || appointment.patientID || appointment.PatientID;
      const patientName = appointment.patientName || appointment.PatientName || 'Unknown Patient';
      
      if (patientId && !patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          name: patientName,
          email: appointment.patientEmail || appointment.PatientEmail || '',
          phoneNumber: appointment.patientPhone || appointment.PatientPhone || '',
          profilePictureURL: appointment.patientProfilePicture || '',
          appointmentCount: 1,
          lastAppointmentDate: appointment.appointmentDate || appointment.AppointmentDate
        });
      } else if (patientId && patientMap.has(patientId)) {
        const patient = patientMap.get(patientId);
        patient.appointmentCount++;
        const currentDate = appointment.appointmentDate || appointment.AppointmentDate;
        if (new Date(currentDate) > new Date(patient.lastAppointmentDate)) {
          patient.lastAppointmentDate = currentDate;
        }
      }
    });
    
    const extractedPatients = Array.from(patientMap.values());
    if (extractedPatients.length > 0) {
      this.patients = extractedPatients;
      this.filteredPatients = [...this.patients];
      console.log('Successfully extracted patients:', this.patients);
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
      width: '600px',
      data: patient
    });
  }

  editPatient(patient: any): void {
    console.log('Edit patient:', patient);
    // TODO: Implement patient edit functionality
  }
}

@Component({
  selector: 'patient-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Patient Details</h2>
    <mat-dialog-content>
      <div class="patient-details">
        <div class="patient-header">
          <img [src]="getPatientAvatar()" alt="Patient Avatar" class="patient-avatar">
          <div class="patient-info">
            <h3>{{ data.name }}</h3>
            <p>ID: {{ data.id }}</p>
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
  
  editPatient(): void {
    this.dialogRef.close('edit');
  }
}