import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { EmrService } from '../../../../core/services/emr.service';
import { CreatePrescriptionDto } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Write Prescription</h2>
    <mat-dialog-content>
      <form [formGroup]="prescriptionForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>

        <div formArrayName="medicines">
          <div *ngFor="let medicine of medicines.controls; let i = index" [formGroupName]="i" class="medicine-item">
            <div class="medicine-header">
              <h4>Medicine {{ i + 1 }}</h4>
              <button mat-icon-button type="button" (click)="removeMedicine(i)" *ngIf="medicines.length > 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <div class="medicine-row">
              <mat-form-field appearance="outline">
                <mat-label>Medicine Name</mat-label>
                <input matInput formControlName="medicineName" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Dosage</mat-label>
                <input matInput formControlName="dosage" placeholder="e.g., 500mg" required>
              </mat-form-field>
            </div>

            <div class="medicine-row">
              <mat-form-field appearance="outline">
                <mat-label>Frequency</mat-label>
                <mat-select formControlName="frequency" required>
                  <mat-option value="Once daily">Once daily</mat-option>
                  <mat-option value="Twice daily">Twice daily</mat-option>
                  <mat-option value="Three times daily">Three times daily</mat-option>
                  <mat-option value="Four times daily">Four times daily</mat-option>
                  <mat-option value="As needed">As needed</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Duration</mat-label>
                <input matInput formControlName="duration" placeholder="e.g., 7 days" required>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Instructions</mat-label>
              <textarea matInput formControlName="instructions" rows="2"></textarea>
            </mat-form-field>
          </div>
        </div>

        <button mat-stroked-button type="button" (click)="addMedicine()" class="add-medicine-btn">
          <mat-icon>add</mat-icon> Add Another Medicine
        </button>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!prescriptionForm.valid || isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Save Prescription' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .medicine-item { 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      padding: 16px; 
      margin-bottom: 16px; 
    }
    .medicine-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 16px; 
    }
    .medicine-header h4 { margin: 0; }
    .medicine-row { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 16px; 
    }
    .medicine-row mat-form-field { flex: 1; }
    .add-medicine-btn { 
      width: 100%; 
      margin-bottom: 16px; 
    }
    mat-dialog-content { 
      max-height: 70vh; 
      overflow-y: auto; 
    }
  `]
})
export class PrescriptionFormComponent {
  prescriptionForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private emrService: EmrService,
    private dialogRef: MatDialogRef<PrescriptionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      encounterID: string, 
      patientID: string, 
      doctorID: string 
    }
  ) {
    this.prescriptionForm = this.fb.group({
      notes: [''],
      medicines: this.fb.array([this.createMedicineGroup()])
    });
  }

  get medicines() {
    return this.prescriptionForm.get('medicines') as FormArray;
  }

  createMedicineGroup(): FormGroup {
    return this.fb.group({
      medicineName: ['', Validators.required],
      dosage: ['', Validators.required],
      frequency: ['', Validators.required],
      duration: ['', Validators.required],
      instructions: ['']
    });
  }

  addMedicine(): void {
    this.medicines.push(this.createMedicineGroup());
  }

  removeMedicine(index: number): void {
    this.medicines.removeAt(index);
  }

  onSave(): void {
    if (this.prescriptionForm.valid) {
      this.isSubmitting = true;
      
      const prescriptionDto: CreatePrescriptionDto = {
        encounterID: this.data.encounterID,
        patientID: this.data.patientID,
        doctorID: this.data.doctorID,
        notes: this.prescriptionForm.value.notes,
        medicines: this.prescriptionForm.value.medicines
      };

      this.emrService.addPrescription(prescriptionDto).subscribe({
        next: (response) => {
          this.dialogRef.close({ success: true, data: response });
        },
        error: (error) => {
          console.error('Error saving prescription:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}