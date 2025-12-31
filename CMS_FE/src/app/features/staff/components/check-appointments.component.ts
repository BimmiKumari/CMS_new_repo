import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-check-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <mat-card class="appointments-card">
      <mat-card-header>
        <mat-card-title>Check Appointments</mat-card-title>
        <mat-card-subtitle>View appointments by date</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Date and Doctor Filters -->
        <div class="filter-section">
          <mat-form-field appearance="outline">
            <mat-label>Select Date</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="onFilterChange()">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Select Doctor</mat-label>
            <mat-select [(value)]="selectedDoctorId" (selectionChange)="onFilterChange()">
              <mat-option value="all">All Doctors</mat-option>
              <mat-option *ngFor="let doctor of doctors" [value]="doctor.id">
                {{ doctor.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <div class="appointment-summary">
            <span>{{ appointments.length }} appointments found</span>
          </div>
        </div>

        <!-- Appointments Table -->
        <div class="table-container" *ngIf="appointments.length > 0">
          <table mat-table [dataSource]="appointments" class="appointments-table">
            
            <!-- Patient Name Column -->
            <ng-container matColumnDef="patientName">
              <th mat-header-cell *matHeaderCellDef>Patient</th>
              <td mat-cell *matCellDef="let appointment">{{ appointment.patientName }}</td>
            </ng-container>

            <!-- Doctor Name Column -->
            <ng-container matColumnDef="doctorName">
              <th mat-header-cell *matHeaderCellDef>Doctor</th>
              <td mat-cell *matCellDef="let appointment">{{ appointment.doctorName }}</td>
            </ng-container>

            <!-- Time Column -->
            <ng-container matColumnDef="time">
              <th mat-header-cell *matHeaderCellDef>Time</th>
              <td mat-cell *matCellDef="let appointment">{{ appointment.startTime }} - {{ appointment.endTime }}</td>
            </ng-container>

            <!-- Type Column -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let appointment">
                <span class="appointment-type" [class.follow-up]="appointment.appointmentType === 1">
                  {{ appointment.appointmentType === 1 ? 'Follow-up' : 'Regular' }}
                </span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let appointment">
                <span class="status-badge" [ngClass]="getStatusClass(appointment.status)">
                  {{ getStatusText(appointment.status) }}
                </span>
              </td>
            </ng-container>

            <!-- Reason Column -->
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let appointment">{{ appointment.reasonForVisit || 'General consultation' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <!-- No Data State -->
        <div *ngIf="appointments.length === 0 && selectedDate" class="no-data">
          <mat-icon>event_busy</mat-icon>
          <h3>No appointments found</h3>
          <p>No appointments scheduled for {{ selectedDate | date:'mediumDate' }}</p>
        </div>

        <!-- Initial State -->
        <div *ngIf="!selectedDate" class="initial-state">
          <mat-icon>date_range</mat-icon>
          <h3>Select a date</h3>
          <p>Choose a date to view appointments</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .appointments-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .filter-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .filter-section mat-form-field {
      min-width: 200px;
    }

    .appointment-summary {
      color: #6b7280;
      font-weight: 500;
    }

    .table-container {
      overflow-x: auto;
    }

    .appointments-table {
      width: 100%;
      background: white;
      border-radius: 8px;
    }

    .appointment-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background: #dbeafe;
      color: #1e40af;
    }

    .appointment-type.follow-up {
      background: #dcfce7;
      color: #15803d;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-scheduled { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #dcfce7; color: #15803d; }
    .status-cancelled { background: #fee2e2; color: #dc2626; }
    .status-in-progress { background: #fef3c7; color: #92400e; }

    .no-data, .initial-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      text-align: center;
      color: #6b7280;
    }

    .no-data mat-icon, .initial-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      color: #d1d5db;
    }

    .no-data h3, .initial-state h3 {
      margin: 0 0 0.5rem 0;
      color: #1f2937;
    }

    .no-data p, .initial-state p {
      margin: 0;
    }
  `]
})
export class CheckAppointmentsComponent implements OnInit {
  selectedDate: Date | null = null;
  selectedDoctorId: string = 'all';
  appointments: any[] = [];
  allAppointments: any[] = [];
  doctors: any[] = [];
  displayedColumns: string[] = ['patientName', 'doctorName', 'time', 'type', 'status', 'reason'];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // Set today's date as default
    this.selectedDate = new Date();
    this.loadDoctors();
    this.loadAppointments();
  }

  loadDoctors(): void {
    // For now, add some sample doctors - replace with actual API call
    this.doctors = [
      { id: 'doctor1', name: 'Dr. Smith' },
      { id: 'doctor2', name: 'Dr. Johnson' },
      { id: 'doctor3', name: 'Dr. Williams' }
    ];
    
    // Also extract from appointments
    this.appointmentService.getAllAppointments().subscribe({
      next: (response: any) => {
        const allAppointments = response.data || response.appointments || response || [];
        const uniqueDoctors = new Map();
        
        allAppointments.forEach((apt: any) => {
          if (apt.doctorID && apt.doctorName) {
            uniqueDoctors.set(apt.doctorID, {
              id: apt.doctorID,
              name: apt.doctorName
            });
          }
        });
        
        const extractedDoctors = Array.from(uniqueDoctors.values());
        if (extractedDoctors.length > 0) {
          this.doctors = extractedDoctors;
        }
        console.log('Loaded doctors:', this.doctors);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });
  }

  onFilterChange(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (!this.selectedDate) {
      this.appointments = [];
      return;
    }

    this.appointmentService.getAllAppointments().subscribe({
      next: (response: any) => {
        this.allAppointments = response.data || response.appointments || response || [];
        this.filterAppointments();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.appointments = [];
      }
    });
  }

  filterAppointments(): void {
    let filteredAppointments = this.allAppointments;

    // Filter by date
    if (this.selectedDate) {
      filteredAppointments = filteredAppointments.filter((apt: any) => {
        const appointmentDate = new Date(apt.appointmentDate);
        return this.isSameDate(appointmentDate, this.selectedDate!);
      });
    }

    // Filter by doctor
    if (this.selectedDoctorId !== 'all') {
      filteredAppointments = filteredAppointments.filter((apt: any) => 
        apt.doctorID === this.selectedDoctorId
      );
    }

    this.appointments = filteredAppointments;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Scheduled';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      case 5: return 'No Show';
      default: return 'Scheduled';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'status-scheduled';
      case 2: return 'status-in-progress';
      case 3: return 'status-completed';
      case 4: return 'status-cancelled';
      case 5: return 'status-cancelled';
      default: return 'status-scheduled';
    }
  }
}