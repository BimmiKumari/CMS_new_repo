import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { EmrService } from '../../../../core/services/emr.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    MatTableModule
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
        <div class="timeline-container">
          <div class="timeline">
            <div *ngFor="let encounter of encounters; let i = index; trackBy: trackByEncounter" class="timeline-item">
              <div class="timeline-marker">
                <mat-icon>{{ getEncounterIcon(encounter.encounterType) }}</mat-icon>
              </div>
              <div class="timeline-content">
                <mat-card class="encounter-card" [class.latest]="i === 0">
                  <mat-card-header>
                    <div class="encounter-header">
                      <div class="encounter-info">
                        <h3>{{ encounter.doctorName }}</h3>
                        <p class="encounter-date">{{ encounter.encounterDate | date:'fullDate' }}</p>
                        <span class="encounter-type">{{ getEncounterType(encounter.encounterType) }}</span>
                      </div>
                      <div class="encounter-summary">
                        <div class="summary-stats">
                          <div class="stat-item" *ngIf="encounter.diagnoses?.length">
                            <mat-icon>medical_services</mat-icon>
                            <span>{{ encounter.diagnoses.length }} Diagnosis</span>
                          </div>
                          <div class="stat-item" *ngIf="encounter.prescriptions?.length">
                            <mat-icon>medication</mat-icon>
                            <span>{{ encounter.prescriptions.length }} Medications</span>
                          </div>
                          <div class="stat-item" *ngIf="encounter.labTests?.length">
                            <mat-icon>science</mat-icon>
                            <span>{{ encounter.labTests.length }} Lab Tests</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </mat-card-header>
                  
                  <mat-card-content>
                    <mat-accordion>
                      <mat-expansion-panel *ngIf="encounter.chiefComplaint">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>chat</mat-icon>
                            Chief Complaint
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <p>{{ encounter.chiefComplaint }}</p>
                      </mat-expansion-panel>

                      <mat-expansion-panel *ngIf="encounter.diagnoses?.length">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>medical_services</mat-icon>
                            Diagnoses ({{ encounter.diagnoses.length }})
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="diagnoses-list">
                          <div *ngFor="let diagnosis of encounter.diagnoses" class="diagnosis-item">
                            <div class="diagnosis-header">
                              <span class="diagnosis-code" *ngIf="diagnosis.diagnosisCode">[{{ diagnosis.diagnosisCode }}]</span>
                              <span class="diagnosis-name">{{ diagnosis.diagnosisName }}</span>
                              <mat-chip *ngIf="diagnosis.isPrimary" class="primary-chip">Primary</mat-chip>
                            </div>
                            <p *ngIf="diagnosis.description" class="diagnosis-desc">{{ diagnosis.description }}</p>
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <mat-expansion-panel *ngIf="encounter.prescriptions?.length">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>medication</mat-icon>
                            Prescriptions ({{ encounter.prescriptions.length }})
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="prescriptions-table">
                          <table class="medication-table">
                            <thead>
                              <tr>
                                <th>Medication</th>
                                <th>Dosage</th>
                                <th>Frequency</th>
                                <th>Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr *ngFor="let prescription of encounter.prescriptions">
                                <td class="med-name">{{ prescription.medicationName }}</td>
                                <td>{{ prescription.dosage }} {{ prescription.unit }}</td>
                                <td>{{ prescription.frequency }}</td>
                                <td>{{ prescription.duration }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </mat-expansion-panel>

                      <mat-expansion-panel *ngIf="encounter.treatmentPlans?.length">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>assignment</mat-icon>
                            Treatment Plans
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div *ngFor="let plan of encounter.treatmentPlans" class="treatment-plan">
                          <div class="plan-section" *ngIf="plan.planDescription">
                            <h5>Treatment Plan</h5>
                            <p>{{ plan.planDescription }}</p>
                          </div>
                          <div class="plan-section" *ngIf="plan.goals">
                            <h5>Goals</h5>
                            <p>{{ plan.goals }}</p>
                          </div>
                          <div class="plan-section" *ngIf="plan.instructions">
                            <h5>Instructions</h5>
                            <p>{{ plan.instructions }}</p>
                          </div>
                          <div class="plan-section" *ngIf="plan.dietaryAdvice">
                            <h5>Dietary Advice</h5>
                            <p>{{ plan.dietaryAdvice }}</p>
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <mat-expansion-panel *ngIf="encounter.labTests?.length">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>science</mat-icon>
                            Lab Tests ({{ encounter.labTests.length }})
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="lab-tests-list">
                          <div *ngFor="let labTest of encounter.labTests" class="lab-test-item">
                            <div class="lab-test-header">
                              <span class="test-name">{{ labTest.testName }}</span>
                              <mat-chip [class]="getTestStatusClass(labTest.status)">{{ labTest.status }}</mat-chip>
                            </div>
                            <p *ngIf="labTest.results" class="test-results">{{ labTest.results }}</p>
                            <p class="test-date">Ordered: {{ labTest.orderedAt | date:'short' }}</p>
                          </div>
                        </div>
                      </mat-expansion-panel>

                      <mat-expansion-panel *ngIf="encounter.observations?.length">
                        <mat-expansion-panel-header>
                          <mat-panel-title>
                            <mat-icon>visibility</mat-icon>
                            Observations ({{ encounter.observations.length }})
                          </mat-panel-title>
                        </mat-expansion-panel-header>
                        <div class="observations-list">
                          <div *ngFor="let obs of encounter.observations" class="observation-item">
                            <span class="obs-name">{{ obs.observationType }}:</span>
                            <span class="obs-value">{{ obs.value }} {{ obs.unit }}</span>
                            <span *ngIf="obs.referenceRange" class="obs-range">(Normal: {{ obs.referenceRange }})</span>
                          </div>
                        </div>
                      </mat-expansion-panel>
                    </mat-accordion>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </div>
        </div>
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
export class HealthRecordsComponent implements OnInit, OnDestroy {
  encounters: any[] = [];
  loading = true;
  currentUser: any;
  private destroy$ = new Subject<void>();
  private isLoadingData = false;

  constructor(
    private emrService: EmrService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadHealthRecords();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadHealthRecords(): void {
    const userId = this.currentUser?.userID;
    
    if (!userId) {
      console.error('No user ID found in loadHealthRecords');
      this.loading = false;
      return;
    }

    if (this.isLoadingData) {
      console.warn('Already loading health records, skipping...');
      return;
    }

    console.log('Loading health records for user:', userId);
    this.loading = true;
    this.isLoadingData = true;

    this.emrService.getUserEncounters(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Raw health records response:', JSON.stringify(response, null, 2));
          try {
            let encountersData = [];
            if (response && response.success && response.data) {
              encountersData = Array.isArray(response.data) ? response.data : [];
            } else if (response && Array.isArray(response)) {
              encountersData = response;
            }
            
            console.log('Encounters data before deduplication:', encountersData.length);
            
            // Remove duplicates based on encounterID
            this.encounters = encountersData.filter((encounter: any, index: number, self: any[]) => {
              if (!encounter.encounterID) {
                console.warn('Encounter without ID found at index:', index, encounter);
                return false;
              }
              return index === self.findIndex((e: any) => e.encounterID === encounter.encounterID);
            });
            
            console.log('Final encounters after deduplication:', this.encounters.length);
            console.log('Encounters:', this.encounters);
          } catch (error) {
            console.error('Error processing health records response:', error);
            this.encounters = [];
          } finally {
            this.loading = false;
            this.isLoadingData = false;
          }
        },
        error: (error) => {
          console.error('Error loading health records:', error);
          this.encounters = [];
          this.loading = false;
          this.isLoadingData = false;
        }
      });
  }

  trackByEncounter(index: number, encounter: any): any {
    return encounter?.encounterID || index;
  }

  getEncounterType(type: number): string {
    return type === 1 ? 'Follow-up' : 'Initial Consultation';
  }

  getEncounterIcon(type: number): string {
    return type === 1 ? 'refresh' : 'medical_services';
  }

  getTestStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  }
}