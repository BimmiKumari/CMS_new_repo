import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  constructor(private apiService: ApiService) {}

  getAllDoctors(): Observable<any> {
    return this.apiService.get('Doctors');
  }

  getDoctorById(id: string): Observable<any> {
    return this.apiService.get(`User/doctors/${id}`);
  }
}