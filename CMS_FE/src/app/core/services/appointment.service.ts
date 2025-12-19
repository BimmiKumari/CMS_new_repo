import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CreateAppointmentDto {
    patientID: string;
    doctorID: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    appointmentType: number;
    reasonForVisit: string;
}

export interface AppointmentDto {
    appointmentID: string;
    patientID: string;
    doctorID: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    appointmentType: number;
    reasonForVisit: string;
}

@Injectable({
    providedIn: 'root'
})
export class AppointmentService {
    constructor(private api: ApiService) { }

    createFollowUpAppointment(dto: CreateAppointmentDto): Observable<any> {
        const appointmentRequest = {
            patientID: dto.patientID,
            doctorID: dto.doctorID,
            appointmentDate: dto.appointmentDate,
            startTime: dto.startTime,
            endTime: dto.endTime,
            appointmentType: dto.appointmentType,
            reasonForVisit: dto.reasonForVisit
        };
        console.log('Sending appointment request:', appointmentRequest);
        return this.api.post<any>('Appointments', appointmentRequest);
    }

    getAppointmentById(appointmentId: string): Observable<any> {
        return this.api.get<any>(`Appointments/${appointmentId}`);
    }

    getAvailableTimeSlots(doctorId: string, date: string): Observable<any> {
        return this.api.get<any>(`TimeSlots/available?doctorId=${doctorId}&date=${date}&userRole=2`);
    }
}