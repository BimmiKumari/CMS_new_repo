import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ApiService } from '../../../../core/services/api.service';

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-followup-schedule',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatListModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>Schedule Follow-up Appointment</h2>
    
    <mat-dialog-content>
      <div class="form-container">
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Follow-up Date</mat-label>
          <input matInput [matDatepicker]="picker" 
                 [(ngModel)]="selectedAppointmentDate" 
                 [min]="minDate" 
                 (dateChange)="onDateChange($event)" 
                 readonly>
          <mat-datepicker-toggle matSuffix [for]="picker">
            <mat-icon matDatepickerToggleIcon>calendar_today</mat-icon>
          </mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div *ngIf="selectedDate" class="time-slots-section">
          <h3>Available Time Slots</h3>
          <div class="time-slots-grid">
            <button 
              *ngFor="let slot of timeSlots" 
              mat-raised-button
              [color]="selectedTimeSlot === slot.time ? 'primary' : ''"
              [class.selected]="selectedTimeSlot === slot.time"
              (click)="selectTimeSlot(slot.time)"
              class="time-slot-btn">
              {{ slot.time }}
            </button>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason for Follow-up</mat-label>
          <textarea matInput [(ngModel)]="reasonForVisit" rows="3" 
                    placeholder="e.g., Lab results review, medication adjustment"></textarea>
        </mat-form-field>

      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              (click)="onSchedule()" 
              [disabled]="!selectedDate || !selectedTimeSlot || !reasonForVisit">
        Schedule Follow-up
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      min-width: 400px;
      padding: 16px 0;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .time-slots-section {
      margin: 24px 0;
    }
    .time-slots-section h3 {
      margin-bottom: 12px;
      color: #333;
    }
    .time-slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .time-slot-btn {
      min-width: 100px;
      height: 40px;
    }
    .time-slot-btn:disabled {
      opacity: 0.5;
    }
    .selected {
      background-color: #1976d2 !important;
      color: white !important;
    }
    .unavailable-text {
      font-size: 10px;
      color: #666;
    }
  `]
})
export class FollowupScheduleComponent implements OnInit {
  minDate = new Date();
  selectedDate: Date | null = null;
  selectedAppointmentDate: Date | null = null;
  selectedTimeSlot: string = '';
  reasonForVisit: string = 'Follow-up consultation';
  timeSlots: TimeSlot[] = [];

  constructor(
    private dialogRef: MatDialogRef<FollowupScheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  onDateChange(event: any): void {
    this.selectedDate = event.value;
    this.selectedAppointmentDate = event.value;
    if (this.selectedDate) {
      this.generateTimeSlots();
    }
  }

  selectTimeSlot(time: string): void {
    this.selectedTimeSlot = time;
  }

  generateTimeSlots(): void {
    if (!this.selectedDate) return;
    
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.appointmentService.getAvailableTimeSlots(this.data.doctorID, dateStr).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.timeSlots = response.data.availableSlots.map((slot: any) => ({
            time: slot.displayTime,
            available: true
          }));
        } else {
          this.timeSlots = [];
        }
      },
      error: (error) => {
        console.error('Error fetching time slots:', error);
        this.timeSlots = [];
      }
    });
  }

  onSchedule(): void {
    if (this.selectedDate && this.selectedTimeSlot && this.reasonForVisit) {
      const [hours, minutes] = this.selectedTimeSlot.split(':');
      const startHour = parseInt(hours);
      const startMinute = parseInt(minutes);
      const endMinute = startMinute + 30;
      const endHour = endMinute >= 60 ? startHour + 1 : startHour;
      const finalEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      
      const year = this.selectedDate.getFullYear();
      const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = this.selectedDate.getDate().toString().padStart(2, '0');
      
      const appointmentDto = {
        patientID: this.data.patientID,
        doctorID: this.data.doctorID,
        appointmentDate: `${year}-${month}-${day}`,
        startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}:00`,
        appointmentType: 2,
        reasonForVisit: this.reasonForVisit
      };

      console.log('Creating appointment:', appointmentDto);
      
      this.appointmentService.createFollowUpAppointment(appointmentDto).subscribe({
        next: (response) => {
          console.log('Appointment created:', response);
          
          // Add the appointment to the queue
          if (response.success && response.data?.appointmentID) {
            this.addToQueue(response.data.appointmentID);
          } else {
            console.error('Unexpected response structure:', response);
            this.dialogRef.close({ success: false, error: 'Unexpected response structure' });
          }
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          this.dialogRef.close({ success: false, error });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  addToQueue(appointmentId: string): void {
    this.apiService.post(`PatientQueue/add/${appointmentId}`, {}).subscribe({
      next: (queueResponse) => {
        console.log('Added to queue:', queueResponse);
        this.dialogRef.close({ 
          success: true, 
          appointment: { appointmentID: appointmentId },
          date: this.selectedDate,
          time: this.selectedTimeSlot
        });
      },
      error: (queueError) => {
        console.error('Error adding to queue:', queueError);
        // Still close as success since appointment was created
        this.dialogRef.close({ 
          success: true, 
          appointment: { appointmentID: appointmentId },
          date: this.selectedDate,
          time: this.selectedTimeSlot
        });
      }
    });
  }
}