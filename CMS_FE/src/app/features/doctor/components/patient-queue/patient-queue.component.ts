import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmrService } from '../../../../core/services/emr.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
    DoctorQueueResponse,
    QueuePatient,
    EncounterDetail,
    QueueStatusType,
    UpdateEncounterDto
} from '../../../emr/models/emr.models';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-patient-queue',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatSnackBarModule
    ],
    templateUrl: './patient-queue.component.html',
    styleUrls: ['./patient-queue.component.css']
})
export class PatientQueueComponent implements OnInit, OnDestroy {
    regularPatients: QueuePatient[] = [];
    followUpPatients: QueuePatient[] = [];
    selectedPatient: QueuePatient | null = null;
    selectedEncounter: EncounterDetail | null = null;
    doctorId: string = '';
    refreshSubscription?: Subscription;

    // Form fields
    chiefComplaint: string = '';
    diagnosis: string = '';
    treatmentPlan: string = '';

    constructor(
        private emrService: EmrService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        const user = this.authService.getCurrentUser();
        this.doctorId = user?.userID || user?.id || '';
        console.log('Doctor User:', user);
        console.log('Doctor ID:', this.doctorId);
    }

    ngOnInit(): void {
        if (this.doctorId) {
            this.loadQueue();
            // Auto-refresh queue every 10 minutes
            this.refreshSubscription = interval(600000).subscribe(() => this.loadQueue());
        } else {
            this.snackBar.open('Doctor ID not found. Please login again.', 'Close', { duration: 5000 });
        }
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }

    loadQueue(): void {
        this.emrService.getDoctorQueue(this.doctorId).subscribe({
            next: (res: any) => {
                console.log('Queue API response:', res);
                
                // Extract data from response
                const data = res.data || res;
                this.regularPatients = data.regularPatients || [];
                this.followUpPatients = data.followUpPatients || [];
                
                console.log('Regular patients:', this.regularPatients.length);
                console.log('Follow-up patients:', this.followUpPatients.length);
                
                // Auto-select first waiting patient
                if (!this.selectedPatient) {
                    const firstPatient = this.regularPatients.find(p => p.queueStatus === QueueStatusType.InProgress)
                        || this.regularPatients.find(p => p.queueStatus === QueueStatusType.Waiting)
                        || this.followUpPatients[0];

                    if (firstPatient) {
                        this.selectPatient(firstPatient);
                    }
                }
            },
            error: (err: any) => {
                console.error('Error loading queue:', err);
                this.snackBar.open('Failed to load patient queue', 'Close', { duration: 3000 });
            }
        });
    }

    selectPatient(patient: QueuePatient): void {
        this.selectedPatient = patient;
        this.loadEncounter(patient.appointmentID);
    }

    loadEncounter(appointmentId: string): void {
        this.emrService.getPatientEncounters(this.selectedPatient!.patientID).subscribe({
            next: (res: any) => {
                if (res.success) {
                    // Find encounter matching today's appointment
                    const encounter = (res.data as EncounterDetail[]).find((e: EncounterDetail) => e.appointmentID === appointmentId);
                    if (encounter) {
                        this.selectedEncounter = encounter;
                        this.chiefComplaint = encounter.chiefComplaint || '';
                        this.diagnosis = encounter.diagnoses?.[0]?.description || '';
                        this.treatmentPlan = encounter.treatmentPlans?.[0]?.description || '';
                    } else {
                        this.selectedEncounter = null;
                    }
                }
            }
        });
    }

    attendPatient(patient: QueuePatient): void {
        this.emrService.updateQueueStatus({
            queueID: patient.queueID,
            newStatus: QueueStatusType.InProgress
        }).subscribe({
            next: (res: any) => {
                this.snackBar.open('Patient status updated', 'Close', { duration: 2000 });
                this.loadQueue();
                this.selectPatient(patient);
            },
            error: (err: any) => this.snackBar.open('Error updating status', 'Close', { duration: 3000 })
        });
    }

    dismissPatient(patient: QueuePatient): void {
        if (confirm('Are you sure you want to dismiss this patient?')) {
            this.emrService.removeFromQueue(patient.queueID).subscribe({
                next: (res: any) => {
                    this.snackBar.open('Patient removed from queue', 'Close', { duration: 2000 });
                    this.loadQueue();
                    if (this.selectedPatient?.queueID === patient.queueID) {
                        this.selectedPatient = null;
                        this.selectedEncounter = null;
                    }
                },
                error: (err: any) => this.snackBar.open('Error removing patient', 'Close', { duration: 3000 })
            });
        }
    }

    updateEHR(): void {
        if (!this.selectedEncounter) return;

        const updateDto: UpdateEncounterDto = {
            encounterID: this.selectedEncounter.encounterID,
            chiefComplaint: this.chiefComplaint,
            assessmentAndPlan: this.diagnosis
        };

        this.emrService.updateEncounter(updateDto).subscribe({
            next: (res: any) => {
                if (res.success) {
                    if (this.treatmentPlan) {
                        this.emrService.addTreatmentPlan({
                            encounterID: this.selectedEncounter!.encounterID,
                            description: this.treatmentPlan,
                            startDate: new Date().toISOString()
                        }).subscribe();
                    }

                    this.snackBar.open('EHR updated successfully', 'Close', { duration: 3000 });

                    this.emrService.updateQueueStatus({
                        queueID: this.selectedPatient!.queueID,
                        newStatus: QueueStatusType.Completed
                    }).subscribe(() => this.loadQueue());
                }
            }
        });
    }

    writePrescription(): void {
        this.snackBar.open('Prescription module coming soon', 'Close', { duration: 3000 });
    }

    assignLabTest(): void {
        this.snackBar.open('Lab test module coming soon', 'Close', { duration: 3000 });
    }

    getInitials(name: string): string {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    }

    formatTime(timeSpan: string): string {
        if (!timeSpan) return '';
        // TimeSpan format is HH:mm:ss, convert to 12-hour format
        const parts = timeSpan.split(':');
        if (parts.length < 2) return timeSpan;
        
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        
        return `${hours}:${minutes} ${period}`;
    }
}
