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
import { CreateLabTestDto } from '../../../emr/models/emr.models';

@Component({
  selector: 'app-lab-test-form',
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
    <h2 mat-dialog-title>Order Lab Tests</h2>
    <mat-dialog-content>
      <form [formGroup]="labTestForm">
        <div formArrayName="tests">
          <div *ngFor="let test of tests.controls; let i = index" [formGroupName]="i" class="test-item">
            <div class="test-header">
              <h4>Test {{ i + 1 }}</h4>
              <button mat-icon-button type="button" (click)="removeTest(i)" *ngIf="tests.length > 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            
            <div class="test-row">
              <mat-form-field appearance="outline">
                <mat-label>Test Name</mat-label>
                <input matInput formControlName="testName" required>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Test Code</mat-label>
                <input matInput formControlName="testCode">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="testCategory">
                <mat-option value="Blood Test">Blood Test</mat-option>
                <mat-option value="Urine Test">Urine Test</mat-option>
                <mat-option value="Imaging">Imaging</mat-option>
                <mat-option value="Biopsy">Biopsy</mat-option>
                <mat-option value="Cardiac">Cardiac</mat-option>
                <mat-option value="Other">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Instructions</mat-label>
              <textarea matInput formControlName="instructions" rows="2" placeholder="Special instructions for the patient"></textarea>
            </mat-form-field>
          </div>
        </div>

        <button mat-stroked-button type="button" (click)="addTest()" class="add-test-btn">
          <mat-icon>add</mat-icon> Add Another Test
        </button>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!labTestForm.valid || isSubmitting">
        {{ isSubmitting ? 'Ordering...' : 'Order Tests' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .test-item { 
      border: 1px solid #e0e0e0; 
      border-radius: 8px; 
      padding: 16px; 
      margin-bottom: 16px; 
    }
    .test-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 16px; 
    }
    .test-header h4 { margin: 0; }
    .test-row { 
      display: flex; 
      gap: 16px; 
      margin-bottom: 16px; 
    }
    .test-row mat-form-field { flex: 1; }
    .add-test-btn { 
      width: 100%; 
      margin-bottom: 16px; 
    }
    mat-dialog-content { 
      max-height: 70vh; 
      overflow-y: auto; 
    }
  `]
})
export class LabTestFormComponent {
  labTestForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private emrService: EmrService,
    private dialogRef: MatDialogRef<LabTestFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      encounterID: string, 
      patientID: string, 
      doctorID: string 
    }
  ) {
    this.labTestForm = this.fb.group({
      tests: this.fb.array([this.createTestGroup()])
    });
  }

  get tests() {
    return this.labTestForm.get('tests') as FormArray;
  }

  createTestGroup(): FormGroup {
    return this.fb.group({
      testName: ['', Validators.required],
      testCode: [''],
      testCategory: [''],
      instructions: ['']
    });
  }

  addTest(): void {
    this.tests.push(this.createTestGroup());
  }

  removeTest(index: number): void {
    this.tests.removeAt(index);
  }

  onSave(): void {
    if (this.labTestForm.valid) {
      this.isSubmitting = true;
      
      const testPromises = this.labTestForm.value.tests.map((test: any) => {
        const labTestDto: CreateLabTestDto = {
          encounterID: this.data.encounterID,
          testName: test.testName,
          testCode: test.testCode,
          testCategory: test.testCategory,
          instructions: test.instructions,
          orderedBy: this.data.doctorID
        };
        return this.emrService.addLabTest(labTestDto).toPromise();
      });

      Promise.all(testPromises).then(() => {
        this.dialogRef.close({ success: true });
      }).catch((error) => {
        console.error('Error ordering lab tests:', error);
        this.isSubmitting = false;
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}