import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmrService } from '../../../../core/services/emr.service';
import { CreateDiagnosisDto } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-diagnosis-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>Add Diagnosis</h2>
    <mat-dialog-content>
      <form [formGroup]="diagnosisForm">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Diagnosis Code (ICD-10)</mat-label>
            <input matInput formControlName="diagnosisCode" placeholder="e.g., J00" required>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Diagnosis Name</mat-label>
            <input matInput formControlName="diagnosisName" placeholder="e.g., Acute nasopharyngitis" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Additional details about the diagnosis"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option value="Provisional">Provisional</mat-option>
            <mat-option value="Confirmed">Confirmed</mat-option>
            <mat-option value="Differential">Differential</mat-option>
            <mat-option value="Ruled_Out">Ruled Out</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="isPrimary" class="primary-checkbox">
          Primary Diagnosis
        </mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!diagnosisForm.valid || isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Save Diagnosis' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-row { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 16px; 
    }
    .form-row mat-form-field { flex: 1; }
    .primary-checkbox { 
      margin-bottom: 16px; 
    }
    mat-dialog-content { 
      min-width: 500px;
    }
  `]
})
export class DiagnosisFormComponent {
  diagnosisForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private emrService: EmrService,
    private dialogRef: MatDialogRef<DiagnosisFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      encounterID: string, 
      doctorID: string 
    }
  ) {
    this.diagnosisForm = this.fb.group({
      diagnosisCode: ['', Validators.required],
      diagnosisName: ['', Validators.required],
      description: [''],
      status: ['Provisional', Validators.required],
      isPrimary: [false]
    });
  }

  onSave(): void {
    if (this.diagnosisForm.valid) {
      this.isSubmitting = true;
      
      const diagnosisDto: CreateDiagnosisDto = {
        encounterID: this.data.encounterID,
        diagnosisCode: this.diagnosisForm.value.diagnosisCode,
        diagnosisName: this.diagnosisForm.value.diagnosisName,
        description: this.diagnosisForm.value.description,
        status: this.diagnosisForm.value.status,
        isPrimary: this.diagnosisForm.value.isPrimary,
        diagnosedBy: this.data.doctorID
      };

      this.emrService.addDiagnosis(diagnosisDto).subscribe({
        next: (response) => {
          this.dialogRef.close({ success: true, data: response });
        },
        error: (error) => {
          console.error('Error saving diagnosis:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
