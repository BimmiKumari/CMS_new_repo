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
import { CreateObservationDto } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-observation-form',
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
    <h2 mat-dialog-title>Clinical Observations</h2>
    <mat-dialog-content>
      <form [formGroup]="observationForm">
        <div formArrayName="observations">
          <div *ngFor="let obs of observations.controls; let i = index" [formGroupName]="i" class="observation-item">
            <div class="observation-header">
              <h4>Observation {{ i + 1 }}</h4>
              <button mat-icon-button type="button" (click)="removeObservation(i)" *ngIf="observations.length > 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observation Name</mat-label>
              <mat-select formControlName="observationName" required>
                <mat-option value="Blood Glucose">Blood Glucose</mat-option>
                <mat-option value="Cholesterol">Cholesterol</mat-option>
                <mat-option value="Hemoglobin">Hemoglobin</mat-option>
                <mat-option value="White Blood Cell Count">White Blood Cell Count</mat-option>
                <mat-option value="Platelet Count">Platelet Count</mat-option>
                <mat-option value="Creatinine">Creatinine</mat-option>
                <mat-option value="Urea">Urea</mat-option>
                <mat-option value="Liver Enzymes">Liver Enzymes</mat-option>
                <mat-option value="Thyroid Function">Thyroid Function</mat-option>
                <mat-option value="Other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="observation-row">
              <mat-form-field appearance="outline">
                <mat-label>Value</mat-label>
                <input matInput formControlName="value" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Unit</mat-label>
                <input matInput formControlName="unit" placeholder="e.g., mg/dL, mmol/L">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reference Range</mat-label>
              <input matInput formControlName="referenceRange" placeholder="e.g., 70-100 mg/dL">
            </mat-form-field>
          </div>
        </div>

        <button mat-stroked-button type="button" (click)="addObservation()" class="add-observation-btn">
          <mat-icon>add</mat-icon> Add Another Observation
        </button>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!observationForm.valid || isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Save Observations' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .observation-item { 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      padding: 16px; 
      margin-bottom: 16px; 
    }
    .observation-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 16px; 
    }
    .observation-header h4 { margin: 0; }
    .observation-row { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 16px; 
    }
    .observation-row mat-form-field { flex: 1; }
    .add-observation-btn { 
      width: 100%; 
      margin-bottom: 16px; 
    }
    mat-dialog-content { 
      max-height: 70vh; 
      overflow-y: auto; 
    }
  `]
})
export class ObservationFormComponent {
  observationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private emrService: EmrService,
    private dialogRef: MatDialogRef<ObservationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      encounterID: string, 
      doctorID: string 
    }
  ) {
    this.observationForm = this.fb.group({
      observations: this.fb.array([this.createObservationGroup()])
    });
  }

  get observations() {
    return this.observationForm.get('observations') as FormArray;
  }

  createObservationGroup(): FormGroup {
    return this.fb.group({
      observationName: ['', Validators.required],
      value: ['', Validators.required],
      unit: [''],
      referenceRange: ['']
    });
  }

  addObservation(): void {
    this.observations.push(this.createObservationGroup());
  }

  removeObservation(index: number): void {
    this.observations.removeAt(index);
  }

  onSave(): void {
    if (this.observationForm.valid) {
      this.isSubmitting = true;
      
      const observationPromises = this.observationForm.value.observations.map((obs: any) => {
        const observationDto: CreateObservationDto = {
          encounterID: this.data.encounterID,
          observationName: obs.observationName,
          value: obs.value,
          unit: obs.unit,
          referenceRange: obs.referenceRange,
          staffID: this.data.doctorID
        };
        return this.emrService.addObservation(observationDto).toPromise();
      });

      Promise.all(observationPromises).then(() => {
        this.dialogRef.close({ success: true });
      }).catch((error) => {
        console.error('Error saving observations:', error);
        this.isSubmitting = false;
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}