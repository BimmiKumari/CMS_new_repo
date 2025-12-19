import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { EmrService } from '../../../../core/services/emr.service';
import { AuthService } from '../../../../core/services/auth.service';
import { QueuePatient, EncounterDetail, QueueStatusType, UpdateEncounterDto } from '../../../emr/models/emr.models';
import { PrescriptionFormComponent } from '../prescription-form/prescription-form.component';
import { LabTestFormComponent } from '../lab-test-form/lab-test-form.component';
import { DiagnosisFormComponent } from '../diagnosis-form/diagnosis-form.component';
import { ObservationFormComponent } from '../observation-form/observation-form.component';
import { FollowupScheduleComponent } from '../followup-schedule/followup-schedule.component';
import { EncounterDetailsDialogComponent } from '../encounter-details-dialog/encounter-details-dialog.component';

@Component({
  selector: 'app-patient-consultation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  template: `
    <div class="consultation-container" *ngIf="selectedPatient">
      <!-- Patient Summary Header -->
      <div class="patient-summary">
        <div class="avatar-large">
          <img *ngIf="selectedPatient.profileImagePath" [src]="selectedPatient.profileImagePath" alt="Patient Photo">
          <div *ngIf="!selectedPatient.profileImagePath" class="no-img">{{
            getInitials(selectedPatient.patientName) }}</div>
        </div>
        <div class="summary-details">
          <div class="summary-header">
            <h2 class="summary-name">{{ selectedPatient.patientName || 'Patient ' + selectedPatient.patientID }}</h2>
            <span class="patient-type-tag">
              <mat-icon>{{ selectedPatient.isFollowUp ? 'refresh' : 'person' }}</mat-icon>
              {{ selectedPatient.isFollowUp ? 'Follow-up Visit' : 'New Consultation' }}
            </span>
          </div>
          <div class="summary-info-grid">
            <div class="info-item">
              <span class="label">Age</span>
              <span class="value">{{ selectedPatient.age || 'N/A' }} years</span>
            </div>
            <div class="info-item">
              <span class="label">Gender</span>
              <span class="value">{{ selectedPatient.sex === 'M' ? 'Male' : selectedPatient.sex === 'F' ? 'Female' : 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Blood Type</span>
              <span class="value">{{ selectedPatient.bloodGroup || 'Not recorded' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Contact</span>
              <span class="value">{{ selectedPatient.phoneNumber || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Last Visit</span>
              <span class="value">{{ lastVisitDate || 'First visit' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Allergies</span>
              <span class="value" [class.text-danger]="selectedPatient.allergies">{{ selectedPatient.allergies || 'None recorded' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical History & Today's Visit -->
      <div class="emr-body">
        <!-- Left: Medical History -->
        <div class="history-side">
          <div class="section-header-row">
            <h3 class="section-title-large">
              <mat-icon>history</mat-icon>
              Medical History
            </h3>
            <button mat-stroked-button color="primary" class="view-emr-btn"
              *ngIf="pastEncounters.length > 0" (click)="viewEncounterDetails(pastEncounters[0])">
              <mat-icon>visibility</mat-icon> View Latest EMR
            </button>
          </div>

          <div class="history-card">
            <div class="past-encounters-section" *ngIf="pastEncounters.length > 0; else noHistory">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Diagnosis</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let enc of pastEncounters">
                    <td>{{ enc.encounterDate | date:'MMM dd, yyyy' }}</td>
                    <td>{{ enc.doctorName }}</td>
                    <td>
                      <div *ngIf="enc.diagnoses?.length; else noDiag">
                        <div *ngFor="let d of enc.diagnoses" class="diagnosis-item">
                          <span class="diag-code" *ngIf="d.diagnosisCode">[{{ d.diagnosisCode }}]</span>
                          <span class="diag-name">{{ d.diagnosisName }}</span>
                          <span class="diag-desc" *ngIf="d.description"> - {{ d.description }}</span>
                        </div>
                      </div>
                      <ng-template #noDiag>N/A</ng-template>
                    </td>
                    <td>
                      <button mat-icon-button color="primary" (click)="viewEncounterDetails(enc)" title="View Details">
                        <mat-icon>info</mat-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noHistory>
              <div class="no-history-msg">No previous encounters found for this user.</div>
            </ng-template>

            <mat-divider class="history-divider"></mat-divider>

            <div class="action-buttons">
              <button mat-flat-button class="secondary-action" (click)="addDiagnosis()">
                <mat-icon>medical_services</mat-icon> Add Diagnosis
              </button>
              <button mat-flat-button class="secondary-action" (click)="writePrescription()">
                <mat-icon>description</mat-icon> Write Prescription
              </button>
              <button mat-flat-button class="secondary-action" (click)="assignLabTest()">
                <mat-icon>science</mat-icon> Order Lab Tests
              </button>
              <button mat-flat-button class="secondary-action" (click)="addObservation()">
                <mat-icon>visibility</mat-icon> Add Observations
              </button>
            </div>

            <div class="consultation-actions">
              <button mat-raised-button color="accent" (click)="scheduleFollowUp()" class="action-btn">
                <mat-icon>schedule</mat-icon> Schedule Follow-up
              </button>
              <button mat-raised-button color="primary" (click)="completeConsultation()" class="action-btn">
                <mat-icon>check_circle</mat-icon> Complete Consultation
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Today's Visit -->
        <div class="visit-side">
          <h3 class="section-title-large">
            <mat-icon>event_note</mat-icon>
            Today's Visit
          </h3>
          <div class="visit-form">
            <div class="form-group">
              <label class="history-label">Chief Complaint</label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput rows="3" [(ngModel)]="chiefComplaint"
                  placeholder="Enter patient's main concern..."></textarea>
              </mat-form-field>
            </div>
            <div class="form-group">
              <label class="history-label">Diagnosis</label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput rows="3" [(ngModel)]="diagnosis"
                  placeholder="Enter diagnosis..."></textarea>
              </mat-form-field>
            </div>
            <div class="form-group">
              <label class="history-label">Treatment Plan</label>
              <mat-form-field appearance="outline" class="full-width">
                <textarea matInput rows="3" [(ngModel)]="treatmentPlan"
                  placeholder="Enter treatment plan..."></textarea>
              </mat-form-field>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./patient-consultation.component.css']
})
export class PatientConsultationComponent implements OnInit {
  @Input() selectedPatient: QueuePatient | null = null;
  
  selectedEncounter: EncounterDetail | null = null;
  pastEncounters: EncounterDetail[] = [];
  doctorId: string = '';
  lastVisitDate: string = '';
  
  // Form fields
  chiefComplaint: string = '';
  diagnosis: string = '';
  treatmentPlan: string = '';

  constructor(
    private emrService: EmrService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    const user = this.authService.getCurrentUser();
    this.doctorId = user?.userID || user?.id || '';
  }

  ngOnInit(): void {
    if (this.selectedPatient) {
      this.loadEncounter(this.selectedPatient.appointmentID);
    }
  }

  loadEncounter(appointmentId: string): void {
    if (!this.selectedPatient) return;
    
    const userIdForEMR = this.selectedPatient.patientID;

    this.emrService.getPatientEncounters(userIdForEMR).subscribe({
      next: (res: any) => {
        if (res.success) {
          const encounters = res.data as EncounterDetail[];
          const encounter = encounters.find((e: EncounterDetail) => e.appointmentID === appointmentId);
          
          if (encounter) {
            this.selectedEncounter = encounter;
            this.chiefComplaint = encounter.chiefComplaint || '';
            this.diagnosis = encounter.diagnoses?.[0]?.description || '';
            this.treatmentPlan = encounter.treatmentPlans?.[0]?.description || '';
          }

          this.pastEncounters = encounters.filter(e => e.appointmentID !== appointmentId);
          this.loadMedicalHistory(encounters);
        }
      },
      error: (err) => {
        console.error('Error loading EMR encounters:', err);
        this.lastVisitDate = 'First visit';
      }
    });
  }

  loadMedicalHistory(encounters: EncounterDetail[]): void {
    if (encounters.length > 1) {
      const lastVisit = encounters
        .sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime())[1];
      this.lastVisitDate = new Date(lastVisit.encounterDate).toLocaleDateString();
    } else {
      this.lastVisitDate = 'First visit';
    }
  }

  getInitials(name: string): string {
    if (!name || name === 'undefined' || name === 'null') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  viewEncounterDetails(encounter: EncounterDetail): void {
    this.dialog.open(EncounterDetailsDialogComponent, {
      width: '900px',
      data: encounter
    });
  }

  addDiagnosis(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedEncounter) {
      this.createEncounterAndOpenDiagnosis();
    } else {
      this.openDiagnosisForm();
    }
  }

  createEncounterAndOpenDiagnosis(): void {
    const encounterDto = {
      patientID: this.selectedPatient!.patientID,
      doctorID: this.doctorId,
      appointmentID: this.selectedPatient!.appointmentID,
      encounterType: this.selectedPatient!.isFollowUp ? 1 : 0,
      chiefComplaint: this.selectedPatient!.chiefComplaint || ''
    };

    this.emrService.createEncounter(encounterDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedEncounter = response.data;
          this.openDiagnosisForm();
        }
      },
      error: (error) => {
        console.error('Error creating encounter:', error);
        this.snackBar.open('Error creating encounter', 'Close', { duration: 3000 });
      }
    });
  }

  openDiagnosisForm(): void {
    const dialogRef = this.dialog.open(DiagnosisFormComponent, {
      width: '600px',
      data: {
        encounterID: this.selectedEncounter!.encounterID,
        doctorID: this.doctorId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Diagnosis added successfully', 'Close', { duration: 3000 });
        this.loadEncounter(this.selectedPatient!.appointmentID);
      }
    });
  }

  writePrescription(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedEncounter) {
      this.createEncounterAndOpenPrescription();
    } else {
      this.openPrescriptionForm();
    }
  }

  createEncounterAndOpenPrescription(): void {
    const encounterDto = {
      patientID: this.selectedPatient!.patientID,
      doctorID: this.doctorId,
      appointmentID: this.selectedPatient!.appointmentID,
      encounterType: this.selectedPatient!.isFollowUp ? 1 : 0,
      chiefComplaint: this.selectedPatient!.chiefComplaint || ''
    };

    this.emrService.createEncounter(encounterDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedEncounter = response.data;
          this.openPrescriptionForm();
        }
      },
      error: (error) => {
        console.error('Error creating encounter:', error);
        this.snackBar.open('Error creating encounter', 'Close', { duration: 3000 });
      }
    });
  }

  openPrescriptionForm(): void {
    const dialogRef = this.dialog.open(PrescriptionFormComponent, {
      width: '800px',
      data: {
        encounterID: this.selectedEncounter!.encounterID,
        patientID: this.selectedPatient!.patientID,
        doctorID: this.doctorId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Prescription saved successfully', 'Close', { duration: 3000 });
        this.loadEncounter(this.selectedPatient!.appointmentID);
      }
    });
  }

  assignLabTest(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedEncounter) {
      this.createEncounterAndOpenLabTest();
    } else {
      this.openLabTestForm();
    }
  }

  createEncounterAndOpenLabTest(): void {
    const encounterDto = {
      patientID: this.selectedPatient!.patientID,
      doctorID: this.doctorId,
      appointmentID: this.selectedPatient!.appointmentID,
      encounterType: this.selectedPatient!.isFollowUp ? 1 : 0,
      chiefComplaint: this.selectedPatient!.chiefComplaint || ''
    };

    this.emrService.createEncounter(encounterDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedEncounter = response.data;
          this.openLabTestForm();
        }
      },
      error: (error) => {
        console.error('Error creating encounter:', error);
        this.snackBar.open('Error creating encounter', 'Close', { duration: 3000 });
      }
    });
  }

  openLabTestForm(): void {
    const dialogRef = this.dialog.open(LabTestFormComponent, {
      width: '700px',
      data: {
        encounterID: this.selectedEncounter!.encounterID,
        patientID: this.selectedPatient!.patientID,
        doctorID: this.doctorId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Lab tests ordered successfully', 'Close', { duration: 3000 });
      }
    });
  }

  addObservation(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedEncounter) {
      this.createEncounterAndOpenObservation();
    } else {
      this.openObservationForm();
    }
  }

  createEncounterAndOpenObservation(): void {
    const encounterDto = {
      patientID: this.selectedPatient!.patientID,
      doctorID: this.doctorId,
      appointmentID: this.selectedPatient!.appointmentID,
      encounterType: this.selectedPatient!.isFollowUp ? 1 : 0,
      chiefComplaint: this.selectedPatient!.chiefComplaint || ''
    };

    this.emrService.createEncounter(encounterDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedEncounter = response.data;
          this.openObservationForm();
        }
      },
      error: (error) => {
        console.error('Error creating encounter:', error);
        this.snackBar.open('Error creating encounter', 'Close', { duration: 3000 });
      }
    });
  }

  openObservationForm(): void {
    const dialogRef = this.dialog.open(ObservationFormComponent, {
      width: '600px',
      data: {
        encounterID: this.selectedEncounter!.encounterID,
        doctorID: this.doctorId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.snackBar.open('Observations added successfully', 'Close', { duration: 3000 });
        this.loadEncounter(this.selectedPatient!.appointmentID);
      }
    });
  }

  scheduleFollowUp(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(FollowupScheduleComponent, {
      width: '600px',
      data: {
        patientID: this.selectedPatient.patientID,
        doctorID: this.doctorId,
        patientName: this.selectedPatient.patientName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        const date = new Date(result.date).toLocaleDateString();
        this.snackBar.open(`Follow-up appointment scheduled for ${date} at ${result.time}`, 'Close', { duration: 5000 });
      }
    });
  }

  completeConsultation(): void {
    if (!this.selectedPatient) {
      this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
      return;
    }

    this.emrService.removeFromQueue(this.selectedPatient.queueID).subscribe({
      next: () => {
        this.snackBar.open(`${this.selectedPatient!.patientName} consultation completed successfully`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error completing consultation:', error);
        this.snackBar.open('Error completing consultation', 'Close', { duration: 3000 });
      }
    });
  }
}