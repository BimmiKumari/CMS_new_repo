import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { EncounterDetail } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-encounter-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Encounter Details - {{ data.encounterDate | date:'MMM dd, yyyy' }}</h2>
      <button mat-icon-button (click)="onClose()" class="close-btn">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <!-- Header Info -->
      <div class="info-section header-info">
        <div class="info-item">
          <span class="label">Doctor:</span>
          <span class="value">{{ data.doctorName }}</span>
        </div>
        <div class="info-item">
          <span class="label">Type:</span>
          <span class="value">{{ getEncounterTypeText(data.encounterType) }}</span>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Vitals -->
      <div class="section" *ngIf="data.vitalSigns?.length">
        <h3 class="section-title"><mat-icon>favorite</mat-icon> Vital Signs</h3>
        <div class="vitals-grid">
          <div class="vital-item" *ngIf="data.vitalSigns[0].temperature">
            <span class="vital-label">Temp:</span>
            <span class="vital-value">{{ data.vitalSigns[0].temperature }}°C</span>
          </div>
          <div class="vital-item" *ngIf="data.vitalSigns[0].bloodPressureSys">
            <span class="vital-label">BP:</span>
            <span class="vital-value">{{ data.vitalSigns[0].bloodPressureSys }}/{{ data.vitalSigns[0].bloodPressureDia }}</span>
          </div>
          <div class="vital-item" *ngIf="data.vitalSigns[0].pulseRate">
            <span class="vital-label">Pulse:</span>
            <span class="vital-value">{{ data.vitalSigns[0].pulseRate }} bpm</span>
          </div>
          <div class="vital-item" *ngIf="data.vitalSigns[0].oxygenSaturation">
            <span class="vital-label">SpO2:</span>
            <span class="vital-value">{{ data.vitalSigns[0].oxygenSaturation }}%</span>
          </div>
        </div>
      </div>

      <!-- Clinical Notes -->
      <div class="section">
        <h3 class="section-title"><mat-icon>notes</mat-icon> Clinical Notes</h3>
        <div class="notes-content">
          <div class="note-item" *ngIf="data.chiefComplaint">
            <span class="note-label">Chief Complaint:</span>
            <p class="note-text">{{ data.chiefComplaint }}</p>
          </div>
          <div class="note-item" *ngIf="data.presentIllnessHistory">
            <span class="note-label">History of Present Illness:</span>
            <p class="note-text">{{ data.presentIllnessHistory }}</p>
          </div>
          <div class="note-item" *ngIf="data.clinicalNotes">
            <span class="note-label">Clinical Notes:</span>
            <p class="note-text">{{ data.clinicalNotes }}</p>
          </div>
          <div class="note-item" *ngIf="data.assessmentAndPlan">
            <span class="note-label">Assessment & Plan:</span>
            <p class="note-text">{{ data.assessmentAndPlan }}</p>
          </div>
        </div>
      </div>

      <!-- Diagnoses -->
      <div class="section" *ngIf="data.diagnoses?.length">
        <h3 class="section-title"><mat-icon>medical_services</mat-icon> Diagnoses</h3>
        <ul class="diagnosis-list">
          <li *ngFor="let d of data.diagnoses" [class.primary]="d.isPrimary">
            <div class="diag-content">
                <div class="diag-row" *ngIf="d.diagnosisCode">
                    <span class="diag-label">Code:</span>
                    <span class="diag-value">{{ d.diagnosisCode }}</span>
                </div>
                <div class="diag-row">
                    <span class="diag-label">Name:</span>
                    <span class="diag-value">{{ d.diagnosisName }}</span>
                </div>
                <div class="diag-row" *ngIf="d.description">
                    <span class="diag-label">Description:</span>
                    <span class="diag-value">{{ d.description }}</span>
                </div>
            </div>
            <span class="diag-tag" *ngIf="d.isPrimary">Primary</span>
          </li>
        </ul>
      </div>

      <!-- Prescriptions -->
      <div class="section" *ngIf="data.prescriptions?.length">
        <h3 class="section-title"><mat-icon>description</mat-icon> Prescriptions</h3>
        <table class="details-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of data.prescriptions">
                <td>{{ p.medicationName }}</td>
                <td>{{ p.dosage }} {{ p.unit }}</td>
                <td>{{ p.frequency }}</td>
                <td>{{ p.duration }}</td>
                <td>{{ p.notes }}</td>
              </tr>
            </tbody>
        </table>
      </div>

      <!-- Observations -->
      <div class="section" *ngIf="data.observations?.length">
        <h3 class="section-title"><mat-icon>visibility</mat-icon> Observations</h3>
        <ul class="observation-list">
          <li *ngFor="let obs of data.observations">
            <span class="obs-type">{{ obs.observationType }}:</span>
            <span class="obs-value">{{ obs.value }}</span>
            <p class="obs-notes" *ngIf="obs.notes">{{ obs.notes }}</p>
          </li>
        </ul>
      </div>

      <!-- Lab Tests -->
      <div class="section" *ngIf="data.labTests?.length">
        <h3 class="section-title"><mat-icon>science</mat-icon> Lab Tests</h3>
        <ul class="lab-list">
          <li *ngFor="let lab of data.labTests">
            <span class="lab-name">{{ lab.testName }}</span>
            <span class="lab-status" [class.completed]="lab.status === 'Completed'">{{ lab.status }}</span>
          </li>
        </ul>
      </div>

      <!-- Treatment Plans -->
      <div class="section" *ngIf="data.treatmentPlans?.length">
        <h3 class="section-title"><mat-icon>assignment</mat-icon> Treatment Plan</h3>
        <div *ngFor="let tp of data.treatmentPlans" class="tp-item">
          <p class="tp-desc">{{ tp.planDescription }}</p>
          <p class="tp-goal" *ngIf="tp.goals"><strong>Goal:</strong> {{ tp.goals }}</p>
        </div>
      </div>

    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    .dialog-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; }
    .close-btn { color: #6c757d; }
    
    .dialog-content {
      padding: 24px;
      max-height: 75vh;
    }

    .section { margin-bottom: 24px; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: #212529;
      margin-bottom: 12px;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 8px;
    }
    .section-title mat-icon { font-size: 20px; width: 20px; height: 20px; color: #0d6efd; }

    .header-info {
      display: flex;
      gap: 32px;
      margin-bottom: 16px;
    }
    .info-item { display: flex; flex-direction: column; }
    .label { font-size: 0.75rem; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 0.95rem; font-weight: 500; color: #212529; }

    .vitals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }
    .vital-item { display: flex; flex-direction: column; align-items: center; }
    .vital-label { font-size: 0.7rem; color: #6c757d; }
    .vital-value { font-size: 1rem; font-weight: 600; color: #0d6efd; }

    .notes-content { display: flex; flex-direction: column; gap: 12px; }
    .note-label { font-size: 0.85rem; font-weight: 600; color: #495057; }
    .note-text { font-size: 0.9rem; color: #212529; margin: 4px 0 0 0; line-height: 1.5; }

    .diagnosis-list, .observation-list, .lab-list { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    .diagnosis-list li, .observation-list li, .lab-list li {
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      background: #f8f9fa;
      border-left: 4px solid #dee2e6;
    }
    .diagnosis-list li.primary { border-left-color: #0d6efd; background: #e7f1ff; }
    
    .diag-content { display: flex; flex-direction: column; gap: 4px; width: 100%; }
    .diag-row { display: flex; gap: 8px; align-items: baseline; }
    .diag-label { font-size: 0.75rem; font-weight: 600; color: #6c757d; min-width: 70px; }
    .diag-value { font-size: 0.9rem; color: #212529; }

    .diag-tag { 
      font-size: 0.7rem; 
      background: #0d6efd; 
      color: white; 
      padding: 2px 6px; 
      border-radius: 4px; 
      margin-left: auto;
      align-self: flex-start;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }
    .details-table th { 
      text-align: left; 
      background: #f8f9fa; 
      padding: 8px; 
      border-bottom: 2px solid #dee2e6; 
    }
    .details-table td { padding: 8px; border-bottom: 1px solid #eee; }

    .lab-status { 
      float: right; 
      font-size: 0.75rem; 
      padding: 2px 8px; 
      border-radius: 12px; 
      background: #fff3cd; 
      color: #856404; 
    }
    .lab-status.completed { background: #d1e7dd; color: #0f5132; }

    .tp-item { background: #f8f9fa; padding: 12px; border-radius: 8px; }
    .tp-desc { margin: 0; font-size: 0.9rem; }
    .tp-goal { margin: 8px 0 0 0; font-size: 0.85rem; color: #6c757d; }
  `]
})
export class EncounterDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EncounterDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EncounterDetail
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  getEncounterTypeText(type: number): string {
    switch (type) {
      case 0: return 'Initial Consultation';
      case 1: return 'Follow-up';
      case 2: return 'Emergency';
      case 3: return 'Routine Checkup';
      default: return 'Consultation';
    }
  }
}
