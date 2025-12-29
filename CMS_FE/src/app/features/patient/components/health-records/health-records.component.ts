import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { EmrService } from '../../../../core/services/emr.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="health-records-container">
      <div class="header">
        <h1>My Health Records</h1>
        <p>Complete medical history and encounter details</p>
      </div>

      <div *ngIf="loading" class="loading-state">
        <mat-icon class="spin">sync</mat-icon>
        <p>Loading your health records...</p>
      </div>

      <div *ngIf="!loading && encounters?.length" class="records-content">
        <mat-card *ngFor="let encounter of encounters; let i = index" class="encounter-card" [class.latest]="i === 0">
          <mat-card-header>
            <mat-icon mat-card-avatar>medical_services</mat-icon>
            <mat-card-title>{{ encounter.doctorName }}</mat-card-title>
            <mat-card-subtitle>{{ encounter.encounterDate | date:'fullDate' }} - {{ getEncounterType(encounter.encounterType) }}</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div *ngIf="encounter.chiefComplaint" class="encounter-section">
              <h4><mat-icon>chat</mat-icon> Chief Complaint</h4>
              <p>{{ encounter.chiefComplaint }}</p>
            </div>

            <div *ngIf="encounter.clinicalNotes" class="encounter-section">
              <h4><mat-icon>note</mat-icon> Clinical Notes</h4>
              <p>{{ encounter.clinicalNotes }}</p>
            </div>

            <div *ngIf="encounter.diagnoses?.length" class="encounter-section">
              <h4><mat-icon>medical_services</mat-icon> Diagnoses</h4>
              <mat-chip-set>
                <mat-chip *ngFor="let diagnosis of encounter.diagnoses">
                  <strong *ngIf="diagnosis.diagnosisCode">[{{ diagnosis.diagnosisCode }}]</strong>
                  {{ diagnosis.diagnosisName }}
                </mat-chip>
              </mat-chip-set>
            </div>

            <div *ngIf="encounter.prescriptions?.length" class="encounter-section">
              <h4><mat-icon>medication</mat-icon> Prescriptions</h4>
              <div *ngFor="let prescription of encounter.prescriptions" class="prescription-item">
                <strong>{{ prescription.medicationName }}</strong>
                <span>{{ prescription.dosage }} {{ prescription.unit }} - {{ prescription.frequency }} for {{ prescription.duration }}</span>
                <p *ngIf="prescription.notes" class="notes">{{ prescription.notes }}</p>
              </div>
            </div>

            <div *ngIf="encounter.treatmentPlans?.length" class="encounter-section">
              <h4><mat-icon>assignment</mat-icon> Treatment Plans</h4>
              <div *ngFor="let plan of encounter.treatmentPlans" class="treatment-plan">
                <p *ngIf="plan.planDescription"><strong>Plan:</strong> {{ plan.planDescription }}</p>
                <p *ngIf="plan.goals"><strong>Goals:</strong> {{ plan.goals }}</p>
                <p *ngIf="plan.instructions"><strong>Instructions:</strong> {{ plan.instructions }}</p>
                <p *ngIf="plan.dietaryAdvice"><strong>Dietary Advice:</strong> {{ plan.dietaryAdvice }}</p>
              </div>
            </div>

            <div *ngIf="encounter.labTests?.length" class="encounter-section">
              <h4><mat-icon>science</mat-icon> Lab Tests</h4>
              <div *ngFor="let labTest of encounter.labTests" class="lab-test-item">
                <strong>{{ labTest.testName }}</strong>
                <mat-chip [class]="getTestStatusClass(labTest.status)">{{ labTest.status }}</mat-chip>
                <p *ngIf="labTest.results" class="results">Results: {{ labTest.results }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!loading && !encounters?.length" class="no-data">
        <mat-icon>folder_open</mat-icon>
        <h3>No Health Records Found</h3>
        <p>Your medical records will appear here after your first appointment.</p>
      </div>
    </div>
  `,
  styleUrls: ['./health-records.component.css']
})
export class HealthRecordsComponent implements OnInit {
  encounters: any[] = [];
  loading = true;
  currentUser: any;

  constructor(
    private emrService: EmrService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadHealthRecords();
  }

  loadHealthRecords(): void {
    const userId = this.currentUser?.userID;
    
    if (!userId) {
      this.loading = false;
      return;
    }

    this.emrService.getUserEncounters(userId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.encounters = response.data;
        } else if (response && Array.isArray(response)) {
          this.encounters = response;
        } else {
          this.encounters = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.encounters = [];
        this.loading = false;
      }
    });
  }

  getEncounterType(type: number): string {
    return type === 1 ? 'Follow-up' : 'Initial Consultation';
  }

  getTestStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  }
}