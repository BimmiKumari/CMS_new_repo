import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient, PatientResponse } from '../../shared/models/Patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {

  private baseurl = "http://localhost:5281/api/Patient";

  constructor(private http: HttpClient) { }

  addPatient(patient: Patient): Observable<PatientResponse> {
    return this.http.post<PatientResponse>(this.baseurl, patient);
  }

}
