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

    createAppointment(dto: CreateAppointmentDto): Observable<any> {
        const appointmentRequest = {
            patientID: dto.patientID,
            doctorID: dto.doctorID,
            appointmentDate: dto.appointmentDate,
            startTime: this.convertTo24Hour(dto.startTime),
            endTime: this.convertTo24Hour(dto.endTime),
            appointmentType: dto.appointmentType,
            reasonForVisit: dto.reasonForVisit
        };
        console.log('Sending appointment request:', appointmentRequest);
        return this.api.post<any>('Appointments', appointmentRequest);
    }

    createFollowUpAppointment(dto: CreateAppointmentDto): Observable<any> {
        return this.createAppointment(dto);
    }

    private convertTo24Hour(time12h: string): string {
        try {
            const [time, period] = time12h.split(' ');
            const [hours, minutes] = time.split(':').map(Number);

            let hour24 = hours;
            if (period === 'PM' && hours !== 12) hour24 += 12;
            if (period === 'AM' && hours === 12) hour24 = 0;

            return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } catch {
            return time12h;
        }
    }

    getAppointmentById(appointmentId: string): Observable<any> {
        return this.api.get<any>(`Appointments/${appointmentId}`);
    }

    getAvailableTimeSlots(doctorId: string, date: string): Observable<any> {
        return this.api.get<any>(`TimeSlots/available?doctorId=${doctorId}&date=${date}&userRole=2`);
    }

    getPatientAppointments(patientId: string): Observable<any> {
        return this.api.get<any>(`Appointments/patient/${patientId}`);
    }

    getAllPatientsFromAppointments(): Observable<any> {
        return this.api.get<any>('Appointments/patients');
    }

    getAllAppointments(): Observable<any> {
        return this.api.get<any>('Appointments/all');
    }

    // Fallback method to get appointments via patients endpoint
    getAllAppointmentsViaPatients(): Observable<any> {
        return this.api.get<any>('Appointments/patients');
    }

    updateAppointmentStatus(appointmentId: string, status: number): Observable<any> {
        return this.api.put<any>(`Appointments/${appointmentId}/status`, { Status: status });
    }

    cancelAppointment(appointmentId: string): Observable<any> {
        return this.api.delete<any>(`Appointments/${appointmentId}`);
    }
}