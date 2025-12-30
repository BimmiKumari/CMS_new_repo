import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EncounterDetail } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-emr-history-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>history</mat-icon>
      Complete EMR History - {{ data.patientName }}
    </h2>
    
    <mat-dialog-content class="dialog-content">
      <div class="table-container">
        <table mat-table [dataSource]="tableData" class="emr-table">
          
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let row">{{ row.date }}</td>
          </ng-container>
          
          <ng-container matColumnDef="doctor">
            <th mat-header-cell *matHeaderCellDef>Doctor</th>
            <td mat-cell *matCellDef="let row">{{ row.doctor }}</td>
          </ng-container>
          
          <ng-container matColumnDef="complaint">
            <th mat-header-cell *matHeaderCellDef>Chief Complaint</th>
            <td mat-cell *matCellDef="let row">{{ row.complaint }}</td>
          </ng-container>
          
          <ng-container matColumnDef="diagnosis">
            <th mat-header-cell *matHeaderCellDef>Diagnosis</th>
            <td mat-cell *matCellDef="let row">{{ row.diagnosis }}</td>
          </ng-container>
          
          <ng-container matColumnDef="prescription">
            <th mat-header-cell *matHeaderCellDef>Prescriptions</th>
            <td mat-cell *matCellDef="let row">{{ row.prescription }}</td>
          </ng-container>
          
          <ng-container matColumnDef="observations">
            <th mat-header-cell *matHeaderCellDef>Observations</th>
            <td mat-cell *matCellDef="let row">{{ row.observations }}</td>
          </ng-container>
          
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      max-height: 70vh;
      overflow: auto;
      padding: 0;
    }
    
    .table-container {
      max-height: 60vh;
      overflow: auto;
    }
    
    .emr-table {
      width: 100%;
    }
    
    .mat-mdc-header-cell {
      font-weight: 600;
      background: #f5f5f5;
    }
    
    .mat-mdc-cell {
      padding: 12px 8px;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
      max-width: 200px;
      word-wrap: break-word;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #1976d2;
    }
  `]
})
export class EmrHistoryDialogComponent {
  displayedColumns = ['date', 'doctor', 'complaint', 'diagnosis', 'prescription', 'observations'];
  tableData: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EmrHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { encounters: EncounterDetail[], patientName: string }
  ) {
    this.prepareTableData();
  }

  prepareTableData(): void {
    console.log('Preparing table data with encounters:', this.data.encounters);
    this.tableData = this.data.encounters.map(encounter => {
      console.log('Processing encounter:', encounter.encounterID, 'Chief Complaint:', encounter.chiefComplaint);
      return {
        date: new Date(encounter.encounterDate).toLocaleDateString(),
        doctor: encounter.doctorName || 'Unknown Doctor',
        complaint: encounter.chiefComplaint || 'Not recorded',
        diagnosis: encounter.diagnoses?.map(d => d.diagnosisName || d.description).join(', ') || 'No diagnosis',
        prescription: encounter.prescriptions?.map(p => `${p.medicationName} (${p.dosage})`).join(', ') || 'No prescriptions',
        observations: encounter.observations?.map(o => o.observationType || o.value || o.notes).filter(Boolean).join(', ') || 'No observations'
      };
    });
    console.log('Final table data:', this.tableData);
  }

  close(): void {
    this.dialogRef.close();
  }
}