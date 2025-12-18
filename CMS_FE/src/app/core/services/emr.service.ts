import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    DoctorQueueResponse,
    UpdateQueueStatusDto,
    EncounterDetail,
    UpdateEncounterDto,
    CreateVitalSignsDto,
    CreateDiagnosisDto,
    CreatePrescriptionDto,
    CreateLabTestDto,
    CreateTreatmentPlanDto,
    QueuePatient
} from '../../features/emr/models/emr.models';

@Injectable({
    providedIn: 'root'
})
export class EmrService {
    constructor(private api: ApiService) { }

    // Patient Queue
    getDoctorQueue(doctorId: string, date?: string): Observable<any> {
        let endpoint = `PatientQueue/doctor/${doctorId}`;
        if (date) {
            endpoint += `?date=${date}`;
        }
        return this.api.get<DoctorQueueResponse>(endpoint);
    }

    updateQueueStatus(dto: UpdateQueueStatusDto): Observable<any> {
        return this.api.put<QueuePatient>('PatientQueue/status', dto);
    }

    removeFromQueue(queueId: string): Observable<any> {
        return this.api.delete<any>(`PatientQueue/${queueId}`);
    }

    // Encounters
    getEncounterById(encounterId: string): Observable<any> {
        return this.api.get<EncounterDetail>(`Encounter/${encounterId}`);
    }

    getPatientEncounters(patientId: string): Observable<any> {
        return this.api.get<EncounterDetail[]>(`Encounter/patient/${patientId}`);
    }

    updateEncounter(dto: UpdateEncounterDto): Observable<any> {
        return this.api.put<EncounterDetail>('Encounter', dto);
    }

    // EMR Components
    addVitalSigns(dto: CreateVitalSignsDto): Observable<any> {
        return this.api.post<any>('Encounter/vitals', dto);
    }

    addDiagnosis(dto: CreateDiagnosisDto): Observable<any> {
        return this.api.post<any>('Encounter/diagnosis', dto);
    }

    addPrescription(dto: CreatePrescriptionDto): Observable<any> {
        return this.api.post<any>('Encounter/prescription', dto);
    }

    addLabTest(dto: CreateLabTestDto): Observable<any> {
        return this.api.post<any>('Encounter/labtest', dto);
    }

    addTreatmentPlan(dto: CreateTreatmentPlanDto): Observable<any> {
        return this.api.post<any>('Encounter/treatmentplan', dto);
    }
}
