import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UpdateProfileRequest {
  name: string;
  phoneNumber: string;
  profilePictureURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private api: ApiService) {}

  updateProfile(profileData: UpdateProfileRequest): Observable<any> {
    return this.api.put<any>('auth/profile', profileData);
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postForm<any>('auth/upload-profile-photo', formData);
  }

  getProfile(): Observable<any> {
    return this.api.get<any>('auth/profile');
  }
}