import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { EmrService } from '../../../../core/services/emr.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PrescriptionFormComponent } from '../prescription-form/prescription-form.component';
import { LabTestFormComponent } from '../lab-test-form/lab-test-form.component';
import { DiagnosisFormComponent } from '../diagnosis-form/diagnosis-form.component';
import { ObservationFormComponent } from '../observation-form/observation-form.component';
import { FollowupScheduleComponent } from '../followup-schedule/followup-schedule.component';
import { EncounterDetailsDialogComponent } from '../encounter-details-dialog/encounter-details-dialog.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
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
    pastEncounters: EncounterDetail[] = [];
    doctorId: string = '';
    refreshSubscription?: Subscription;

    // Form fields
    chiefComplaint: string = '';
    diagnosis: string = '';
    treatmentPlan: string = '';

    // Medical history
    previousConditions: string = '';
    currentMedications: string = '';
    lastVisitDate: string = '';

    constructor(
        private emrService: EmrService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private appointmentService: AppointmentService
    ) {
        const user = this.authService.getCurrentUser();
        this.doctorId = user?.userID || user?.id || '';
        console.log('Doctor User:', user);
        console.log('Doctor ID:', this.doctorId);
    }

    ngOnInit(): void {
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        console.log('Token exists:', !!token);
        console.log('Doctor ID:', this.doctorId);

        if (!token) {
            this.snackBar.open('Please login again - session expired', 'Close', { duration: 5000 });
            return;
        }

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
                console.log('Sample regular patient:', this.regularPatients[0]);
                console.log('Sample follow-up patient:', this.followUpPatients[0]);



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
                this.snackBar.open('Failed to load patient queue. Click refresh to try again.', 'Close', { duration: 5000 });
            }
        });
    }



    refreshQueue(): void {
        this.loadQueue();
    }

    selectPatient(patient: QueuePatient): void {
        this.selectedPatient = patient;
        this.loadEncounter(patient.appointmentID);
    }

    loadEncounter(appointmentId: string): void {
        const userIdForEMR = this.selectedPatient!.patientID;

        this.emrService.getPatientEncounters(userIdForEMR).subscribe({
            next: (res: any) => {
                if (res.success) {
                    const encounters = res.data as EncounterDetail[];

                    // Find encounter matching today's appointment
                    const encounter = encounters.find((e: EncounterDetail) => e.appointmentID === appointmentId);
                    if (encounter) {
                        this.selectedEncounter = encounter;
                        this.chiefComplaint = encounter.chiefComplaint || '';
                        this.diagnosis = encounter.diagnoses?.[0]?.description || '';
                        this.treatmentPlan = encounter.treatmentPlans?.[0]?.description || '';
                    } else {
                        this.selectedEncounter = null;
                    }

                    // Load medical history from previous encounters
                    this.pastEncounters = encounters.filter(e => e.appointmentID !== appointmentId);
                    this.loadMedicalHistory(encounters);
                }
            },
            error: (err) => {
                console.error('Error loading EMR encounters:', err);
                // Set defaults if EMR fails
                this.previousConditions = 'No previous conditions recorded';
                this.currentMedications = 'No current medications';
                this.lastVisitDate = 'First visit';
            }
        });
    }

    loadMedicalHistory(encounters: EncounterDetail[]): void {
        // Get previous conditions from past diagnoses
        const conditions = encounters
            .flatMap(e => e.diagnoses || [])
            .filter(d => d.isPrimary)
            .map(d => d.description)
            .filter((value, index, self) => self.indexOf(value) === index)
            .join(', ');

        this.previousConditions = conditions || 'No previous conditions recorded';

        // Get current medications from latest prescription
        const latestEncounter = encounters
            .filter(e => e.prescriptions && e.prescriptions.length > 0)
            .sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime())[0];

        if (latestEncounter?.prescriptions?.length) {
            const medications = latestEncounter.prescriptions
                .map(p => `${p.medicationName} ${p.dosage}`)
                .join(', ');
            this.currentMedications = medications;
        } else {
            this.currentMedications = 'No current medications';
        }

        // Get last visit date
        if (encounters.length > 1) {
            const lastVisit = encounters
                .sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime())[1];
            this.lastVisitDate = new Date(lastVisit.encounterDate).toLocaleDateString();
        } else {
            this.lastVisitDate = 'First visit';
        }
    }

    reloadEncounterData(): void {
        if (!this.selectedPatient) return;
        
        // Preserve current form values
        const currentChiefComplaint = this.chiefComplaint;
        const currentDiagnosis = this.diagnosis;
        const currentTreatmentPlan = this.treatmentPlan;
        
        const userIdForEMR = this.selectedPatient.patientID;

        this.emrService.getPatientEncounters(userIdForEMR).subscribe({
            next: (res: any) => {
                if (res.success) {
                    const encounters = res.data as EncounterDetail[];
                    const encounter = encounters.find((e: EncounterDetail) => e.appointmentID === this.selectedPatient!.appointmentID);
                    
                    if (encounter) {
                        this.selectedEncounter = encounter;
                    }

                    // Update past encounters for history
                    this.pastEncounters = encounters.filter(e => e.appointmentID !== this.selectedPatient!.appointmentID);
                    this.loadMedicalHistory(encounters);
                    
                    // Restore form values
                    this.chiefComplaint = currentChiefComplaint;
                    this.diagnosis = currentDiagnosis;
                    this.treatmentPlan = currentTreatmentPlan;
                }
            },
            error: (err) => {
                console.error('Error reloading encounter data:', err);
            }
        });
    }

    acceptPatient(patient: QueuePatient): void {
        this.emrService.updateQueueStatus({
            queueID: patient.queueID,
            newStatus: QueueStatusType.InProgress
        }).subscribe({
            next: (res: any) => {
                this.snackBar.open(`${patient.patientName} accepted for consultation`, 'Close', { duration: 3000 });
                patient.queueStatus = QueueStatusType.InProgress;
            },
            error: (err: any) => this.snackBar.open('Error accepting patient', 'Close', { duration: 3000 })
        });
    }

    attendPatient(patient: QueuePatient): void {
        this.acceptPatient(patient);
    }

    rejectPatient(patient: QueuePatient): void {
        if (confirm(`Are you sure you want to reject ${patient.patientName}?`)) {
            this.emrService.removeFromQueue(patient.queueID).subscribe({
                next: (res: any) => {
                    this.snackBar.open(`${patient.patientName} has been removed from queue`, 'Close', { duration: 3000 });
                    this.loadQueue();
                    if (this.selectedPatient?.queueID === patient.queueID) {
                        this.selectedPatient = null;
                        this.selectedEncounter = null;
                    }
                },
                error: (err: any) => this.snackBar.open('Error rejecting patient', 'Close', { duration: 3000 })
            });
        }
    }

    dismissPatient(patient: QueuePatient): void {
        this.rejectPatient(patient);
    }

    updateEHR(): void {
        if (!this.selectedPatient) return;

        if (!this.selectedEncounter) {
            this.createEncounterAndUpdateEHR();
        } else {
            this.performEHRUpdate();
        }
    }

    createEncounterAndUpdateEHR(): void {
        const encounterDto = {
            patientID: this.selectedPatient!.patientID,
            doctorID: this.doctorId,
            appointmentID: this.selectedPatient!.appointmentID,
            encounterType: this.selectedPatient!.isFollowUp ? 1 : 0,
            chiefComplaint: this.chiefComplaint || this.selectedPatient!.chiefComplaint || ''
        };

        this.emrService.createEncounter(encounterDto).subscribe({
            next: (response) => {
                if (response.success) {
                    this.selectedEncounter = response.data;
                    this.performEHRUpdate();
                }
            },
            error: (error) => {
                console.error('Error creating encounter:', error);
                this.snackBar.open('Error creating encounter', 'Close', { duration: 3000 });
            }
        });
    }

    performEHRUpdate(): void {
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
        if (!this.selectedPatient) {
            this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
            return;
        }

        // Create encounter if it doesn't exist
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
                this.selectedPatient!.hasPrescription = true;
                this.snackBar.open('Prescription saved successfully', 'Close', { duration: 3000 });
                this.reloadEncounterData();
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
                // Mark patient as follow-up for lab results
                this.markPatientAsFollowUp();
            }
        });
    }

    markPatientAsFollowUp(): void {
        this.emrService.updateQueueStatus({
            queueID: this.selectedPatient!.queueID,
            newStatus: QueueStatusType.Completed
        }).subscribe(() => {
            this.loadQueue();
            this.snackBar.open('Patient marked for follow-up after lab results', 'Close', { duration: 3000 });
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
                this.reloadEncounterData();
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
                this.reloadEncounterData();
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
                // Remove patient from current queue
                this.emrService.removeFromQueue(this.selectedPatient!.queueID).subscribe({
                    next: () => {
                        const date = new Date(result.date).toLocaleDateString();
                        this.snackBar.open(`Follow-up appointment scheduled for ${date} at ${result.time}. Patient removed from current queue.`, 'Close', { duration: 5000 });
                        this.loadQueue();
                        this.selectedPatient = null;
                        this.selectedEncounter = null;
                    },
                    error: (error) => {
                        console.error('Error removing patient from queue:', error);
                        this.snackBar.open('Follow-up scheduled but error removing from queue', 'Close', { duration: 3000 });
                    }
                });
            }
        });
    }

    completeConsultation(): void {
        if (!this.selectedPatient) {
            this.snackBar.open('Please select a patient first', 'Close', { duration: 3000 });
            return;
        }

        // Remove patient from queue completely
        this.emrService.removeFromQueue(this.selectedPatient.queueID).subscribe({
            next: () => {
                this.snackBar.open(`${this.selectedPatient!.patientName} consultation completed and discharged successfully`, 'Close', { duration: 3000 });
                this.loadQueue();
                this.selectedPatient = null;
                this.selectedEncounter = null;
            },
            error: (error) => {
                console.error('Error completing consultation:', error);
                this.snackBar.open('Error completing consultation', 'Close', { duration: 3000 });
            }
        });
    }

    getInitials(name: string): string {
        if (!name || name === 'undefined' || name === 'null') return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

    getTotalPatients(): number {
        return this.regularPatients.length + this.followUpPatients.length;
    }

    getStatusText(status: QueueStatusType): string {
        switch (status) {
            case QueueStatusType.Waiting:
                return 'Waiting';
            case QueueStatusType.InProgress:
                return 'In Progress';
            case QueueStatusType.Completed:
                return 'Completed';
            case QueueStatusType.Cancelled:
                return 'Cancelled';
            case QueueStatusType.Delayed:
                return 'Delayed';
            default:
                return 'Unknown';
        }
    }

    viewEncounterDetails(encounter: EncounterDetail): void {
        this.dialog.open(EncounterDetailsDialogComponent, {
            width: '900px',
            data: encounter
        });
    }
}
